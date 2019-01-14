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
        {"size": 50, "id": "0", "type": "circle"},
        {"size": 50, "id": "1", "type": "circle"},
        {"size": 50, "id": "2", "type": "circle"},
        {"size": 50, "id": "3", "type": "circle"},
        {"size": 50, "id": "4", "type": "circle"},
        {"size": 50, "id": "5", "type": "circle"},
        {"size": 50, "id": "6", "type": "circle"},
        {"size": 60, "id": "7", "type": "square"},
        {"size": 10, "id": "8", "type": "square"},
        {"size": 60, "id": "9", "type": "square"},
        {"size": 10, "id": "10", "type": "square"},
        {"size": 60, "id": "11", "type": "square"},
        {"size": 10, "id": "12", "type": "square"},
        {"size": 50, "id": "13", "type": "square"}],
    "directed": false,
    "multigraph": false
};

function color(n){
    if(n > 16*16*16 || n < 0) return null;
    let str = n.toString(16);
    while(str.length < 3){
        str = "0" + str;
    }
    let arr2 = ['f', 'e', 'd', 'c', 'b', 'a', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0'];
    let arr1 = ['0', 'f', '1', 'e', '2', 'd', '3', 'c', '4', 'b', '5', 'a', '6', '9', '7', '8'];
    let ret = "";
    str[1] = arr1[parseInt(str[1], 16)];
    str[2] = arr2[parseInt(str[2], 16)];
    ret = "#" + str[0] + str[0] + str[1] + str[1] + str[2] + str[2];
    //console.log(ret);
    return ret;
}

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
        return this.getLog(this.getBest());
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

    getLog(gen){
        let ret = this.json;
        for(let i=0; i<this.vertex; i++) ret.nodes[i].color = color((gen[i]*128)%(16*16*16));
        for(let i=0; i<ret.links.length; i++){
            let a = parseInt(ret.links[i].source), b = parseInt(ret.links[i].target);
            if(gen[a] === gen[b]) ret.links[i].color = "#ff0000";
            else ret.links[i].color = "#000000";
        }
        ret.cost = this.cost(gen);
        //console.log(ret);
        return ret;
    }

    run_range(startColor, endColor, iter){
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

    run(k, iter){
        let log = new Array();
        this.init(k);
        let score, bestGen;
        for(let cnt=1; cnt<=iter; cnt++){
            this.nextGen();
            bestGen = this.getBest();
            score = this.cost(bestGen);
            log.push(this.getLog(bestGen));
            if(score === 0) break;
        }
        return log;
    }
}


let tmp = new GCP(tmpJson, 6);
tmp.printAdjList();
tmp.init(10);

//tmp.nextGen();
