import { MovementUtils } from "utils/MovementUtils";
import { Carrier } from "./carrier";
import { SpawnUtils } from "utils/SpawnUtils";
import { Upgrader } from "./upgrader";
import { Harvester } from "./harvester";

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


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("⛏");
        }

        const firstRoom = Game.rooms[creep.memory.firstSpawnCoords];


        if(!creep.memory.carrying) {



            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                creep.say("⛏ 🔄");
            }

           // if(creep.room.controller?.my && creep.room.find(FIND))

            const mineFlag = Game.flags[creep.memory.firstSpawnCoords + 'MineFlag'];


            if(!!!mineFlag) {
                return;
            }

            const mineHostiles = mineFlag.room?.find(FIND_HOSTILE_CREEPS, {
                filter: (creep) => (creep.getActiveBodyparts(ATTACK) > 0 || creep.getActiveBodyparts(RANGED_ATTACK) > 0 ) && creep.owner.username === 'Invader'
            }).length;

            if(mineFlag.room?.controller?.reservation || mineHostiles) {
                if(creep.room != firstRoom) {
                    creep.say("😨",true)
                    creep.moveTo(firstRoom.find(FIND_CREEPS)[0])
                } else if(mineHostiles){
                    Carrier.run(creep);
                }
                return;
            }


            if(creep.room != mineFlag.room) {
                MovementUtils.goToFlag(creep,mineFlag);
                return;
            }



            let targetSource = Harvester.findTargetSource(creep);

            if(targetSource) {
                creep.moveTo(targetSource);
            }

            const finalSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if(finalSource) {
                const mineResult = creep.harvest(finalSource);
                if(mineResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(finalSource);
                }
            } else {
                creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            }





        }else {
            const roomStructures = firstRoom.find(FIND_MY_SPAWNS)

            if(creep.room !== firstRoom) {
                creep.moveTo(roomStructures[0]);
                return;
            }

            const nearestAvailableWorkingRoleCreep = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter:  (creep) => {
                    return (
                       ( creep.memory.role === 'builder' || creep.memory.role === 'upgrader') && creep.store.getFreeCapacity() > 0)
                }
            });

            const largeStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter:  (structure) => {
                    return (
                       structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                    ) &&
                        structure.store[RESOURCE_ENERGY] > 500000;
                }
            });
            if(largeStorage || creep.room.controller?.level == 7 || (creep.room.energyAvailable > 0 && creep.room.energyAvailable == creep.room.energyCapacityAvailable)) {

                Carrier.run(creep,true);

            } else {
                Carrier.run(creep);
            }





        }
    }

}

