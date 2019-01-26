# pragma GCC optimize ("O3")
# pragma GCC optimize ("Ofast")
# pragma GCC optimize ("unroll-loops")

#include <bits/stdc++.h>
using namespace std;

const int v = 49, e = 952;
const int genN = 300;
const int k = 7;
const int muteRate = 15;
const int limit = 500000;
int pool[genN][v];
int newPool[genN][v];
vector<int> g[v];
vector< pair<int, int> > edge;

int res[limit + 10];

void makeGraph(){
	for(int i=0; i<e; i++){
		char e; int a, b;
		scanf("%c %d %d\n", &e, &a, &b);
		edge.push_back({a, b});
		g[a].push_back(b);
		g[b].push_back(a);
	}
}

void fillOnePool(int t){
	register int i;
	for(i=0; i<k; i++){
		pool[t][i] = i;
	}
	for(i=k; i<v; i++){
		pool[t][i] = rand()%k;
	}
	for(i=0; i<v/2; i++){
		int a = rand()%v, b = rand()%v;
		swap(pool[t][a], pool[t][b]);
	}
}

void init(){
	for(int i=0; i<genN; i++) fillOnePool(i);
}

int cost(int gen){
	int ret = 0;
	for(int i=0; i<e; i++){
		int a = edge[i].first, b = edge[i].second;
		ret += pool[gen][a] == pool[gen][b];
	}
	return ret;
}

void mutation(int gen){
	for(int i=0; i<v; i++){
		int bias = rand()%10000;
		if(bias < muteRate) newPool[gen][i] = rand()%k;
	}
}

int bestCost(){
	int ret = 1 << 20;
	for(int i=0; i<genN; i++){
		ret = min(ret, cost(i));
	}
	return ret;
}

void copyArr(int a, int b){
	for(int i=0; i<v; i++){
		newPool[a][i] = pool[b][i];
	}
}

int nextGen(){
	register int i, j;
	int idx = 0;
	for(i=0; i<genN; i+=2){
		if(cost(i) > cost(i+1)) copyArr(idx, i+1);
		else copyArr(idx, i);
		idx++;
	}
	for(i=0; i<genN/2; i++){
		int idx2 = 0;
		int nxt = (i+1) % (genN/2);
		for(j=0; j<v; j++){
			int rnd = rand()&255;
			if(rnd&128) newPool[idx][j] = newPool[i][j];
			else newPool[idx][j] = newPool[nxt][j];
		}
		idx++;
	}
	for(i=0; i<genN; i++){
		mutation(i);
	}
	memcpy(pool, newPool, sizeof(pool));
	return bestCost();
}

int getMaxDegree(){
	int ret = 0;
	for(int i=0; i<v; i++) ret = max(ret, (int)g[i].size());
	return ret;
}

int main(){
	FILE *in = freopen("graph.txt", "r", stdin);
	FILE *out = freopen("output01.txt", "w", stdout);
	makeGraph();
	srand(time(NULL));
	init();
	printf("%d\n", time(NULL));
	
	int i;
	int now;
	for(i=1; i<=limit; i++){
		now = nextGen();
		res[i] = now;
		if(!now) break;
	}
	printf("%d\n", time(NULL));
	for(int a=1; a<=min(i, limit); a++) printf("%d\n", res[a]);
	if(now != 0) printf("fail");
	fclose(in);
	fclose(out);
}
