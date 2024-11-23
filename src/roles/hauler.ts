import { Labs } from "labs";
import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";
import { Miner } from "./miner";
import { Carrier } from "./carrier";

export class Hauler {
    public static run(creep: Creep): void {

        if (!creep.memory.carrying && creep.store.getFreeCapacity() == 0) {
            creep.memory.carrying = true;
        }

        if (creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.carrying = false;
        }


        if(!creep.memory.isBoosted) {
            const canContinue = Labs.boostCreep(creep)
            if(!canContinue) {
                return;
            }
        }


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("⛏");
        }

        if(!!!creep.memory?.firstSpawnCoords) {
            return;
        }

        const firstRoom = Game.rooms[creep.memory.firstSpawnCoords];

        if(!creep.memory.carrying) {



            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                creep.say("⛏ 🔄");
            }


            if(!creep.memory.assignedMineFlag) {
                creep.memory.assignedMineFlag = 'W18N4MineFlag';
                return;
            }
    
            const mineFlag = Game.flags[creep.memory.assignedMineFlag] as Flag;
    

            if(!!!mineFlag) {
                return;
            }



            if(creep.room != mineFlag.room) {
                MovementUtils.goToFlag(creep,mineFlag);
                return;
            }


            const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter:  (source) => {
                    return (
                        source.amount >= 50


                    )
                }
            });

            if(creep.room === mineFlag.room && droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
                creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
                return
            }

            const droppedT = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter:  (source) => {
                    return (
                        source.store.energy >= 50


                    )
                }
            });

            if(droppedT && creep.withdraw(droppedT,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(droppedT, {visualizePathStyle: {stroke: '#ffaa00'}});
                return
            }

            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && (structure.store[RESOURCE_ENERGY] >= creep.store.getCapacity() || structure.store[RESOURCE_ENERGY] >= 200)
            })

            if(creep.room === mineFlag.room && droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
                creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
                return;
            }

            if(container && creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(container, {visualizePathStyle: {stroke: "#ffffff"}});
            } else if(!container && droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
                creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
            }

        }else {
            this.dropOffStuff(creep,firstRoom)

        }









    }

    private static dropOffStuff(creep:Creep,firstRoom: any) {
        const roomStructures = firstRoom.find(FIND_MY_SPAWNS)

            if(creep.room !== firstRoom) {
                creep.moveTo(roomStructures[0]);
                return;
            }

            Carrier.run(creep);
    }

}
