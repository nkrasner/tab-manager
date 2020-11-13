//A graph holding urls with weighted connections

class urlGraph {
	constructor() {
		this.edges = {};
		this.nodes = [];
	}

	addNode(node) {
		this.nodes.push(node);
		this.edges[node] = [];
	}

	addEdge(node1, node2, weight = 1) {
		this.edges[node1].push({node:node2, weight:weight});
		this.edges[node2].push({node:node1, weight:weight});
	}

    isNode(node) {
        return (this.nodes.indexOf(node) != -1);
    }

	getNeighbors(node) {
		return this.edges[node];
	}
}