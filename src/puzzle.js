// Unit Circle Facts
const SQ3O2 = 0.86602540
const SQ2O2 = 0.70710678
const NSQ3O2 = -0.86602540
const NSQ2O2 = -0.70710678

// Map your unified clockwise directions (0 = Up, 2 = Right, 4 = Down, 6 = Left)
export const DIRECTION_VECTORS = {
    0: { x: 0,  y: -1 },
    1: { x: 0.5,  y: -0.86602540 },
    2: { x: 0.70710678,  y: -0.70710678 },
    3: { x: 0.86602540,  y: -0.5 },
    4: { x: 1,  y: 0 },
    5: { x: 0.86602540,  y: 0.5 },
    6: { x: 0.70710678,  y: 0.70710678 },
    7: { x: 0.5,  y: 0.86602540 },

    8: { x: 0,  y: 1 },
    9: { x: -0.5,  y: 0.86602540 },
    10: { x: -0.70710678,  y: 0.70710678 },
    11: { x: -0.86602540,  y: 0.5 },
    12: { x: -1,  y: 0 },
    13: { x: -0.86602540,  y: -0.5 },
    14: { x: -0.70710678,  y: -0.70710678 },
    15: { x: -0.5,  y: -0.86602540 }
};

export default function usePuzzleLayout(puzzle, cellSize = 80) {
    // 1. Traverse the topology graph to calculate unshifted raw coordinates
    const rawCoords = {};
    const visited = new Set();

    const vertexKeys = Object.keys(puzzle.topology.vertices);
    if (vertexKeys.length === 0) return { vertices: {}, puzzleWidth: 0, puzzleHeight: 0 };

    // Pick the first vertex as our temporary absolute (0,0) center point
    const firstVertex = vertexKeys[0];
    rawCoords[firstVertex] = { x: 0, y: 0 };

    const queue = [firstVertex];
    visited.add(firstVertex);

    while (queue.length > 0) {
        const currentV = queue.shift();
        const currentPos = rawCoords[currentV];
        const connectedEdges = puzzle.topology.vertices[currentV];

        for (const eId of connectedEdges) {
            try{
                const edge = puzzle.topology.edges[eId];
                const neighborV = edge.va === currentV ? edge.vb : edge.va;

                if (!visited.has(neighborV)) {
                    const vec = DIRECTION_VECTORS[edge.dir];
                    // Flip vector scale if moving opposite to the edge's defined direction
                    const modifier = edge.va === currentV ? 1 : -1;

                    rawCoords[neighborV] = {
                        x: currentPos.x + vec.x * cellSize * modifier,
                        y: currentPos.y + vec.y * cellSize * modifier
                    };

                    visited.add(neighborV);
                    queue.push(neighborV);
                }
            } catch(e) {
                console.log(`Error Parsing Puzzle - at Edge ${eId} - ${e}`)
            }

        }
    }

    // 2. Find bounding boxes to establish absolute normalization boundaries
    const coords = Object.values(rawCoords);
    const minX = Math.min(...coords.map(c => c.x));
    const maxX = Math.max(...coords.map(c => c.x));
    const minY = Math.min(...coords.map(c => c.y));
    const maxY = Math.max(...coords.map(c => c.y));

    // Shift everything so the top-left vertex boundary maps tightly to (0,0)
    const normalizedVertices = {};
    for (const [vId, pos] of Object.entries(rawCoords)) {
        normalizedVertices[vId] = {
            x: pos.x - minX,
            y: pos.y - minY
        };
    }

    return {
        vertices: normalizedVertices,
        puzzleWidth: maxX - minX,
        puzzleHeight: maxY - minY
    };
}