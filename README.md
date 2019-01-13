# GCP-by-GeneticAlgorithm
선린인터넷고등학교 정올반 프로젝트
* 대주제 : 휴리스틱
* 소주제 : 유전 알고리즘을 이용한 그래프 컬러링

#### class Graph
* Method
    * constructor(JSON) : 인자로 들어오는 JSON을 기반으로 그래프 모델링
    * printAdjList() : 인접리스트 출력
* Field
    * json : 그래프 json
    * verties : 정점 배열
    * edges : 간선 배열
    * vectex : 정점 개수
    * adj : 인접 리스트

#### class GCP extends Graph
* Method
    * constructor(JSON, N) : JSON 기반으로 그래프 모델링, 유전자 N개 사용
    * init(K) : K개의 색깔을 사용해 모든 유전자 초기화
        * init_fillOnePool : 유전자 1개 초기화
    * cost(gen) : 해당 유전자에서 bad edge의 개수
    * nextGen() : 다음 세대로 진화 - 토너먼트 선택, 균등 교차 사용
        * mutation(gen) : 0.15%의 확률로 돌연변이
    * getBest() : 현재 세대에서 가장 cost가 낮은(가장 적합한) 유전자 반환
    * printPool() : pool 출력
    * run(c1, c2, iter) : c1-coloring부터 c2-coloring까지 차례대로 수행(c1 &gt;= c2, iter세대까지만 진화)
* Field
    * genN : 유전자 개수
    * pool : 유전자 집합
    * k : 그래프를 색칠할 때 사용할 색깔의 개수 (k-coloring)
