import { MovementUtils } from "utils/MovementUtils";
import { Carrier } from "./carrier";
import { SpawnUtils } from "utils/SpawnUtils";
import { Upgrader } from "./upgrader";
import { Harvester } from "./harvester";

export class Miner {



    public static run(creep: Creep): void {









        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("⛏");
        }


        const spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_SPAWN && structure.room?.controller?.my


                )
            }
        });

        let miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.room.name == spawn?.room.name);

        const extractor = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_EXTRACTOR
        })[0] ?? null;

        const storage = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_STORAGE
        })[0] ?? null;

        const terminal = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_TERMINAL
        })[0] ?? null;

        const mineral = creep.room.find(FIND_MINERALS)[0];


        if(storage && mineral && mineral.mineralAmount > 0 && extractor && miners[0] &&  creep.name === miners[0]?.name && creep.room.controller && creep.room.controller.my && creep.room.controller?.level >= 6) {
            creep.memory.extractorMiner = true;
        } else {
            creep.memory.extractorMiner = false;
        }


        if(!!!creep.memory?.firstSpawnCoords) {
            return;
        }


        const firstRoom = Game.rooms[creep.memory.firstSpawnCoords];


        if(creep.memory.extractorMiner === true) {
            if(creep.store[RESOURCE_ENERGY] > 0) {
                this.dropOffStuff(creep,firstRoom);
                return;
            }
            this.creepExtractor(creep,extractor,storage,terminal,mineral);
            return;
        }

        this.creepMiner(creep,firstRoom);



    }

    private static creepExtractor(creep:Creep,extractor:AnyStructure,storage:AnyStructure,terminal:AnyStructure,mineral:Mineral) {

        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("⛏ ⛰");
        }





        if(!mineral || !extractor || !storage) {
            return;
        }

        if(!creep.memory.carrying && ((creep.store.getFreeCapacity() == 0) || (creep?.ticksToLive && creep.ticksToLive < 60))) {
            creep.memory.carrying = true;

        }

        if(creep.memory.carrying && creep.store[mineral.mineralType] == 0) {
            creep.memory.carrying = false;
        }

        if(!creep.memory.carrying) {

            const droppedMinerals = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter:  (source) => {
                    return (
                        source.amount >= 0 && source.resourceType === mineral.mineralType


                    )
                }
            });

            const droppedMineralTombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter:  (tomb) => {
                    return (
                        tomb.store && tomb.store[mineral.mineralType] > 0

                    )
                }
            });

            if(droppedMineralTombstone && creep.withdraw(droppedMineralTombstone,mineral.mineralType) === ERR_NOT_IN_RANGE){
                creep.moveTo(droppedMineralTombstone, {visualizePathStyle: {stroke: '#ffaa00'}});
            }else if(droppedMinerals && creep.pickup(droppedMinerals) === ERR_NOT_IN_RANGE){
                creep.moveTo(droppedMinerals, {visualizePathStyle: {stroke: '#ffaa00'}});
            }else if(extractor && mineral && creep.harvest(mineral) === ERR_NOT_IN_RANGE){
                creep.moveTo(extractor, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if(storage && creep.room.controller?.my && mineral && creep.withdraw(storage,mineral.mineralType) === ERR_NOT_IN_RANGE){
                creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            if(terminal && mineral && creep.transfer(terminal,mineral.mineralType) === ERR_NOT_IN_RANGE){
                creep.moveTo(terminal, {visualizePathStyle: {stroke: '#ffaa00'}});
            }else if(storage && mineral && creep.transfer(storage,mineral.mineralType) === ERR_NOT_IN_RANGE){
                creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffaa00'}});
            }

        }
    }

    private static creepMiner(creep:Creep,firstRoom:any) {

        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("⛏");
        }

        if(!creep.memory.carrying && (creep.store.getFreeCapacity() == 0)) {
            creep.memory.carrying = true;

        }

        if(creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.carrying = false;
        }


        if(!creep.memory.carrying) {



            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                creep.say("⛏ 🔄");
            }
            const mineFlag = Game.flags[creep.memory.firstSpawnCoords + 'MineFlag'];


            if(!!!mineFlag) {
                return;
            }

            const mineHostiles = mineFlag.room?.find(FIND_HOSTILE_CREEPS, {
                filter: (creep) => (creep.getActiveBodyparts(ATTACK) > 0 || creep.getActiveBodyparts(RANGED_ATTACK) > 0 ) && creep.owner.username === 'Invader'
            }).length;


            if(mineHostiles) {
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


            const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter:  (source) => {
                    return (
                        source.amount >= 50


                    )
                }
            });

            if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
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



            let targetSource = Harvester.findTargetSource(creep);

            if(targetSource) {
                creep.moveTo(targetSource);
            }

            const finalSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if(finalSource) {
                const mineResult = creep.harvest(finalSource);
                if(mineResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(finalSource, {visualizePathStyle: {stroke: '#FFFFFF'}});
                }
            } else {
                creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);

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

