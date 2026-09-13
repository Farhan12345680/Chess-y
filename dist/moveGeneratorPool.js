"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_worker_threads_1 = require("node:worker_threads");
const chess_js_1 = require("chess.js");
function parseMove(move) {
    const trimmed = move.trim();
    const uci = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/i.exec(trimmed);
    if (uci) {
        return {
            from: uci[1].toLowerCase(),
            to: uci[2].toLowerCase(),
            promotion: uci[3]?.toLowerCase()
        };
    }
    return trimmed;
}
node_worker_threads_1.parentPort?.on("message", (request) => {
    if (request.type !== "validate") {
        return;
    }
    try {
        const chess = new chess_js_1.Chess(request.fen);
        const legalMoves = chess.moves({ verbose: true }).map((move) => ({
            from: move.from,
            to: move.to,
            promotion: move.promotion ?? null,
            san: move.san
        }));
        const parsedMove = parseMove(request.move);
        let appliedMove;
        try {
            appliedMove = chess.move(parsedMove);
        }
        catch {
            const response = {
                id: request.id,
                ok: true,
                valid: false,
                legalMoves
            };
            node_worker_threads_1.parentPort?.postMessage(response);
            return;
        }
        const fen = chess.fen();
        const fenParts = fen.split(" ");
        const halfmoveClock = Number(fenParts[4]);
        let status = "playing";
        if (chess.isCheckmate()) {
            status = "checkmate";
        }
        else if (chess.isStalemate()) {
            status = "stalemate";
        }
        else if (chess.isInsufficientMaterial()) {
            status = "insufficientMaterial";
        }
        else if (halfmoveClock >= 100) {
            status = "fiftyMove";
        }
        const uci = `${appliedMove.from}` +
            `${appliedMove.to}` +
            `${appliedMove.promotion ?? ""}`;
        const response = {
            id: request.id,
            ok: true,
            valid: true,
            fen,
            san: appliedMove.san,
            uci,
            legalMoves,
            status
        };
        node_worker_threads_1.parentPort?.postMessage(response);
    }
    catch (error) {
        const response = {
            id: request.id,
            ok: false,
            valid: false,
            error: error instanceof Error ? error.message : String(error)
        };
        node_worker_threads_1.parentPort?.postMessage(response);
    }
});
