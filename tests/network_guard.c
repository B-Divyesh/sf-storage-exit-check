#include <errno.h>
#include <netdb.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>

static void record_attempt(const char *name) {
    const char *path = getenv("STORAGE_EXIT_CHECK_NETWORK_LOG");
    if (path == NULL) {
        return;
    }
    FILE *log = fopen(path, "a");
    if (log != NULL) {
        fprintf(log, "%s\n", name);
        fclose(log);
    }
}

int socket(int domain, int type, int protocol) {
    (void)domain;
    (void)type;
    (void)protocol;
    record_attempt("socket");
    errno = EPERM;
    return -1;
}

int connect(int socket, const struct sockaddr *address, socklen_t address_length) {
    (void)socket;
    (void)address;
    (void)address_length;
    record_attempt("connect");
    errno = EPERM;
    return -1;
}

int getaddrinfo(const char *node, const char *service,
                const struct addrinfo *hints, struct addrinfo **result) {
    (void)node;
    (void)service;
    (void)hints;
    (void)result;
    record_attempt("getaddrinfo");
    return EAI_FAIL;
}
