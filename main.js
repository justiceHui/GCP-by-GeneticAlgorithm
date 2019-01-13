let tmpJson = {
    "graph": [],
    "links": [
        {"source": 0, "target": 1},
        {"source": 0, "target": 2},
        {"source": 0, "target": 3},
        {"source": 0, "target": 4},
        {"source": 0, "target": 5},
        {"source": 0, "target": 6},
        {"source": 1, "target": 3},
        {"source": 1, "target": 4},
        {"source": 1, "target": 5},
        {"source": 1, "target": 6},
        {"source": 2, "target": 4},
        {"source": 2, "target": 5},
        {"source": 2, "target": 6},
        {"source": 3, "target": 5},
        {"source": 3, "target": 6},
        {"source": 5, "target": 6},
        {"source": 0, "target": 7},
        {"source": 1, "target": 8},
        {"source": 2, "target": 9},
        {"source": 3, "target": 10},
        {"source": 4, "target": 11},
        {"source": 5, "target": 12},
        {"source": 6, "target": 13}],
    "nodes": [
        {"size": 60, "score": 0, "id": "Androsynth", "type": "circle"},
        {"size": 10, "score": 0.2, "id": "Chenjesu", "type": "circle"},
        {"size": 60, "score": 0.4, "id": "Ilwrath", "type": "circle"},
        {"size": 10, "score": 0.6, "id": "Mycon", "type": "circle"},
        {"size": 60, "score": 0.8, "id": "Spathi", "type": "circle"},
        {"size": 10, "score": 1, "id": "Umgah", "type": "circle"},
        {"id": "VUX", "type": "circle"},
        {"size": 60, "score": 0, "id": "Guardian", "type": "square"},
        {"size": 10, "score": 0.2, "id": "Broodhmome", "type": "square"},
        {"size": 60, "score": 0.4, "id": "Avenger", "type": "square"},
        {"size": 10, "score": 0.6, "id": "Podship", "type": "square"},
        {"size": 60, "score": 0.8, "id": "Eluder", "type": "square"},
        {"size": 10, "score": 1, "id": "Drone", "type": "square"},
        {"id": "Intruder", "type": "square"}],
    "directed": false,
    "multigraph": false
};

class Graph{
    constructor(json){
        this.json = json;
        this.verties = json.nodes;
        this.edges = json.links;
        this.vertex = this.verties.length;
        this.adj = new Array();

        for(let i=0; i<this.vertex; i++){
            this.adj.push(new Array());
        }
        for(let i of this.edges){
            let a = parseInt(i.source), b = parseInt(i.target);
            this.adj[a].push(b); this.adj[b].push(a);
        }
    }

    printAdjList(){
        for(let i in this.adj) {
            let str = "";
            str += i + " : ";
            let v = this.adj[i];
            for (let j of v) str += j + " ";
            console.log(str);
        }
    }
}

class GCP extends Graph{
    constructor(graphJson, geneticN){
        super(graphJson);
        this.genN = geneticN;
        //this.color = new Array(this.vertex);

        this.pool = new Array(this.genN);
        for(let i=0; i<this.genN; i++) this.pool[i] = new Array(this.vertex);
    }

    init_fillOnePool(t, k){ //t번째 유전자 초기화
        for(let i=0; i<k; i++){
            this.pool[t][i] = i;
        }
        for(let i=k; i<this.vertex; i++){
            this.pool[t][i] = Math.floor(Math.random()*k);
        }
        for(let i=0; i<this.vertex/2; i++){
            let a = Math.floor(Math.random()*this.vertex);
            let b = Math.floor(Math.random()*this.vertex);
            let tmp = this.pool[t][a];
            this.pool[t][a] = this.pool[t][b];
            this.pool[t][b] = tmp;
        }
    }

    init(k){
        this.k = k;
        console.log("init...");
        for(let i=0; i<this.genN; i++) this.init_fillOnePool(i, k);
    }

    cost(gen){
        let ret = 0;
        for(let i of this.edges){
            let a = i.source, b = i.target;
            if(gen[a] === gen[b]) ret++;
        }
        return ret;
    }

    mutation(gen){
        for(let i in gen){
            let bias = Math.random();
            if(bias <= 0.15) gen[i] = Math.floor(Math.random()*this.k);
        }
        return gen;
    }

    nextGen(){
        console.log("nxtgen");
        let newPool = new Array(this.vertex);
        let idx = 0;
        for(let i=0; i<this.genN; i++) newPool[i] = new Array(this.vertex);
        for(let i=0; i<this.genN; i+=2){
            if(this.cost(this.pool[i]) > this.cost(this.pool[i+1])){
                newPool[idx++] = this.pool[i+1];
            }else newPool[idx++] = this.pool[i];
        }

        for(let i=0; i<this.genN/2; i++){
            let tmp = new Array(this.vertex);
            let nxt = (i+1)%(this.genN/2);
            for(let j=0; j<this.vertex; j++){
                let rnd = Math.random();
                if(rnd < 0.5) tmp[j] = newPool[i][j];
                else tmp[j] = newPool[nxt][j];
            }
            newPool[idx++] = tmp;
        }
        for(let i in newPool) newPool[i] = this.mutation(newPool[i]);
        this.pool = newPool;
    }

    getBest(){
        let minScore = this.edges.length + 10;
        let bestidx = -1;
        for(let i=0; i<this.genN; i++){
            let c = this.cost(this.pool[i]);
            if(c < minScore){
                minScore = c;
                bestidx = i;
            }
        }
        return this.pool[bestidx];
    }

    printPool(){
        for(let i=0; i<this.genN; i++){
            console.log(this.pool[i].join(" ") + " :: " + this.cost(this.pool[i]));
        }
    }

    run(startColor, endColor, iter){
        for(let i=startColor; i>=endColor; i--){
            this.init(i);
            let score, bestGen;
            for(let cnt=1; cnt<=iter; cnt++){
                this.nextGen();
                bestGen = this.getBest();
                score = this.cost(bestGen);
                if(score === 0) break;
            }
            console.log("k = " + i + " :: cost = " + score + " :: color = " + bestGen.join(" "));
            if(score !== 0) break;
        }
    }
}

function main(){
    let tmp = new GCP(tmpJson, 15000);
    tmp.printAdjList();

    tmp.run(14, 5, 150);
}


main();
