
export default class MatchQueue {

    constructor() {

        this.bullet = [];
        this.blitz = [];
        this.rapid = [];
    }


    getQueue(gameType) {

        switch (gameType) {

            case "bullet":
                return this.bullet;

            case "blitz":
                return this.blitz;

            case "rapid":
                return this.rapid;

            default:
                return null;
        }
    }


    add(gameType, ws) {

        const queue = this.getQueue(gameType);

        if (queue === null) {
            return false;
        }

        queue.push(ws);

        return true;
    }


    pop(gameType) {

        const queue = this.getQueue(gameType);

        if (queue === null || queue.length === 0) {
            return null;
        }

        return queue.shift();
    }


    remove(ws) {

        const queues = [
            this.bullet,
            this.blitz,
            this.rapid
        ];


        for (const queue of queues) {

            const index = queue.indexOf(ws);

            if (index !== -1) {
                queue.splice(index, 1);
            }
        }
    }
}
