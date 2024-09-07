import { MovementUtils } from "utils/MovementUtils";
import { Carrier } from "./carrier";

export class Miner {



    public static run(creep: Creep): void {


        if(!creep.memory.carrying && (creep.store.getFreeCapacity() == 0)) {
            creep.memory.carrying = true;

        }

        if(creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.carrying = false;
        }

        if(!!!creep.memory?.firstSpawnCoords) {
            return;
        }

        if(!creep.memory.carrying) {




            const mineFlag = Game.flags[creep.memory.firstSpawnCoords + 'MineFlag'];
            if(!!!mineFlag) {
                return;
            }

            if(!creep.pos.isNearTo(mineFlag)) {
                MovementUtils.goToFlag(creep,mineFlag);
                return;
            }

            creep.say("⛏");

            let targetSource = mineFlag.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

            if(targetSource && creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetSource);
            }
        }else {
            creep.say("🚚");
            const firstRoom = Game.rooms[creep.memory.firstSpawnCoords]
            const roomStructures = firstRoom.find(FIND_MY_SPAWNS)

            if(creep.room !== firstRoom) {
                creep.moveTo(roomStructures[0]);
                return;
            }

            Carrier.run(creep);


        }
    }

}

