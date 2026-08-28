#define _GNU_SOURCE
#include <dlfcn.h>
#include <fcntl.h>
#include <limits.h>
#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/syscall.h>
#include <unistd.h>

static void record_path(char operation, int dirfd, const char *path) {
  const char *log_path = getenv("STORAGE_EXIT_CHECK_FS_LOG");
  if (!log_path || !path) return;
  char resolved[PATH_MAX * 2];
  if (path[0] == '/') {
    snprintf(resolved, sizeof resolved, "%s", path);
  } else if (dirfd == AT_FDCWD) {
    char cwd[PATH_MAX];
    if (!getcwd(cwd, sizeof cwd)) return;
    snprintf(resolved, sizeof resolved, "%s/%s", cwd, path);
  } else {
    char descriptor[64], base[PATH_MAX];
    snprintf(descriptor, sizeof descriptor, "/proc/self/fd/%d", dirfd);
    ssize_t length = readlink(descriptor, base, sizeof base - 1);
    if (length < 0) return;
    base[length] = '\0';
    snprintf(resolved, sizeof resolved, "%s/%s", base, path);
  }
  int log = syscall(SYS_openat, AT_FDCWD, log_path, O_WRONLY | O_CREAT | O_APPEND, 0600);
  if (log < 0) return;
  char line[PATH_MAX * 2 + 4];
  int length = snprintf(line, sizeof line, "%c %s\n", operation, resolved);
  syscall(SYS_write, log, line, (size_t)length);
  syscall(SYS_close, log);
}

static char access_kind(int flags) {
  return ((flags & O_ACCMODE) != O_RDONLY || (flags & (O_CREAT | O_TRUNC | O_APPEND))) ? 'W' : 'R';
}

int open(const char *path, int flags, ...) {
  static int (*real_open)(const char *, int, ...) = NULL;
  if (!real_open) real_open = dlsym(RTLD_NEXT, "open");
  mode_t mode = 0;
  if (flags & O_CREAT) { va_list args; va_start(args, flags); mode = va_arg(args, mode_t); va_end(args); }
  record_path(access_kind(flags), AT_FDCWD, path);
  return flags & O_CREAT ? real_open(path, flags, mode) : real_open(path, flags);
}

int open64(const char *path, int flags, ...) {
  static int (*real_open64)(const char *, int, ...) = NULL;
  if (!real_open64) real_open64 = dlsym(RTLD_NEXT, "open64");
  mode_t mode = 0;
  if (flags & O_CREAT) { va_list args; va_start(args, flags); mode = va_arg(args, mode_t); va_end(args); }
  record_path(access_kind(flags), AT_FDCWD, path);
  return flags & O_CREAT ? real_open64(path, flags, mode) : real_open64(path, flags);
}

int openat(int dirfd, const char *path, int flags, ...) {
  static int (*real_openat)(int, const char *, int, ...) = NULL;
  if (!real_openat) real_openat = dlsym(RTLD_NEXT, "openat");
  mode_t mode = 0;
  if (flags & O_CREAT) { va_list args; va_start(args, flags); mode = va_arg(args, mode_t); va_end(args); }
  record_path(access_kind(flags), dirfd, path);
  return flags & O_CREAT ? real_openat(dirfd, path, flags, mode) : real_openat(dirfd, path, flags);
}

int mkdir(const char *path, mode_t mode) {
  static int (*real_mkdir)(const char *, mode_t) = NULL;
  if (!real_mkdir) real_mkdir = dlsym(RTLD_NEXT, "mkdir");
  record_path('W', AT_FDCWD, path);
  return real_mkdir(path, mode);
}

int mkdirat(int dirfd, const char *path, mode_t mode) {
  static int (*real_mkdirat)(int, const char *, mode_t) = NULL;
  if (!real_mkdirat) real_mkdirat = dlsym(RTLD_NEXT, "mkdirat");
  record_path('W', dirfd, path);
  return real_mkdirat(dirfd, path, mode);
}
