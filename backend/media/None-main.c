
#include <stdio.h>
#include <string.h>

#include "vector.h"

int main()
{
    int m, n, val;

    Vector *v;

    v = vector_construct();

    scanf("%d %d", &m, &n);

    for (int i = 0; i < m; i++)
    {
        scanf("%d", &val);
        vector_push_back(v, val);
    }

    for (int i = 0; i < n; i++)
    {
        scanf("%d", &val);
        printf("%d\n", vector_binary_search(v, val));
    }

    vector_destroy(v);

    return 0;
}
