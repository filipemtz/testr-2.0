#include "bt.h"
#include <stdio.h>
#include <time.h>
#include <stdlib.h>

int main(){
    BinaryTree *bt = bt_construct();

    int n=0;
    scanf("%d",&n);

    srand(time(NULL)); 
    for(int i = 0; i < n; i++){
        int r = rand();
        bt_insert(bt,r);
    }

    printf("TAM: %d\n",bt_height(bt));

    bt_print(bt);
    bt_destroy(bt);
}