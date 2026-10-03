export default class MatchQueue {

    constructor() {
        this.queues = new Map();
    }


    getQueue(timeControl) {

        if (!this.queues.has(timeControl)) {
            this.queues.set(timeControl, []);
        }

        return this.queues.get(timeControl);
    }


    add(timeControl, ws) {

        if (
            typeof timeControl !== "string" ||
            !/^\d+\+\d+$/.test(timeControl)
        ) {
            return false;
        }

        const queue = this.getQueue(timeControl);

        queue.push(ws);

        return true;
    }


    pop(timeControl) {

        const queue = this.queues.get(timeControl);

        if (!queue || queue.length === 0) {
            return null;
        }

        const ws = queue.shift();

        if (queue.length === 0) {
            this.queues.delete(timeControl);
        }

        return ws;
    }


    remove(ws) {

        for (const [timeControl, queue] of this.queues) {

            const index = queue.indexOf(ws);

            if (index !== -1) {
                queue.splice(index, 1);
            }

            if (queue.length === 0) {
                this.queues.delete(timeControl);
            }
        }
    }
}