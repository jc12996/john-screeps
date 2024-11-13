import { MovementUtils } from "utils/MovementUtils";
import { Carrier } from "./carrier";
import { SpawnUtils } from "utils/SpawnUtils";
import { Upgrader } from "./upgrader";
import { Harvester } from "./harvester";
import { Labs } from "labs";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import { RepairUtils } from "utils/RepairUtils";
import { RoomUtils } from "utils/RoomUtils";

export class Miner {



    public static run(creep: Creep): void {





        if(!creep.memory.isBoosted) {
            const canContinue = Labs.boostCreep(creep)
            if(!canContinue) {
                return;
            }
        }




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
        })[0] as StructureTerminal ?? null;

        const mineral = creep.room.find(FIND_MINERALS)[0];


        if(!!!creep.memory?.firstSpawnCoords) {
            return;
        }

        const firstRoom = Game.rooms[creep.memory.firstSpawnCoords];
        const firstRoomCommandLevel = firstRoom.controller?.level ?? 0 ;

        if(storage && mineral && firstRoom.terminal && firstRoom.terminal.store[mineral.mineralType] < 50000
            && mineral.mineralAmount > 0
             && extractor && miners[0] &&  creep.name === miners[0]?.name && creep.room.controller && creep.room.controller.my && creep.room.controller?.level >= 6 && creep.getActiveBodyparts(WORK) > 0) {
            creep.memory.extractorMiner = true;
        } else if(!creep.memory.extractorMiner) {
            creep.memory.extractorMiner = false;
        } else if((firstRoom.terminal && firstRoom.terminal.store[mineral.mineralType] >= 50000)) {
            if(firstRoom.terminal.store[mineral.mineralType] && creep.store[mineral.mineralType] > 0) {
                creep.drop(mineral.mineralType)
            }
            creep.memory.extractorMiner = false;
        }


        let mineType: "mine" | "haul" | "allAround" = 'allAround';





        if(firstRoomCommandLevel >= 6) {
            if(creep.getActiveBodyparts(WORK) > 0 ) {
                mineType = 'mine';
            } else if(creep.memory.hauling){
                mineType = 'haul';
            } else {
                mineType = 'allAround';
            }
            const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter:  (source) => {
                    return (
                        source.amount >= 50


                    )
                }
            });
            if(creep.memory.hauling && mineType !== 'mine' && droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
                creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
                return
            }

        }






        if(creep.memory.extractorMiner === true && terminal?.store?.getFreeCapacity() > 0 && creep.getActiveBodyparts(WORK) > 0) {
            if(creep.store[RESOURCE_ENERGY] > 0) {
                this.dropOffStuff(creep,firstRoom);
                return;
            }
            this.creepExtractor(creep,extractor,storage,terminal,mineral);
            return;
        }

        this.creepMiner(creep,firstRoom, mineType);



    }

    private static creepExtractor(creep:Creep,extractor:AnyStructure,storage:AnyStructure,terminal:StructureTerminal,mineral:Mineral) {

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

            const hLabs = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter:  (source) => {
                    return (
                        source.structureType == STRUCTURE_LAB && source.store[mineral.mineralType]


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
            }
            else if(droppedMinerals && creep.pickup(droppedMinerals) === ERR_NOT_IN_RANGE){
                creep.moveTo(droppedMinerals, {visualizePathStyle: {stroke: '#ffaa00'}});
            }else if(extractor && mineral && creep.harvest(mineral) === ERR_NOT_IN_RANGE){
                creep.moveTo(extractor, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if(storage && creep.room.controller?.my && mineral && creep.withdraw(storage,mineral.mineralType) === ERR_NOT_IN_RANGE){
                creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if(hLabs && creep.withdraw(hLabs,mineral.mineralType, 100) === ERR_NOT_IN_RANGE){
                creep.moveTo(hLabs, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            if(terminal && mineral && creep.transfer(terminal,mineral.mineralType) === ERR_NOT_IN_RANGE){
                creep.moveTo(terminal, {visualizePathStyle: {stroke: '#ffaa00'}});
            }else if(storage && mineral && creep.transfer(storage,mineral.mineralType) === ERR_NOT_IN_RANGE){
                creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffaa00'}});
            }

        }
    }

    private static creepMiner(creep:Creep,firstRoom:any, minerType: "mine" | "haul" | "allAround") {

        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say("⛏");
        }



        if(!creep.memory.carrying && (creep.store.getFreeCapacity() == 0 || creep.store[RESOURCE_ENERGY] > 500)) {
            creep.memory.carrying = true;

        }

        if((creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) || minerType === 'mine') {
            creep.memory.carrying = false;
        }

        const constructionContainers = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
            filter: (struc) => {
                return struc.structureType === STRUCTURE_CONTAINER && minerType === 'mine'
            }
        })[0]??null;

        const repairContainers = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (struc) => {
                return struc.structureType === STRUCTURE_CONTAINER && minerType === 'mine' && struc.hits < (struc.hitsMax - 150000)
            }
        })[0]??null;

        const containers = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (struc) => {
                return struc.structureType === STRUCTURE_CONTAINER && minerType === 'mine'
            }
        })[0]??null;

        if((constructionContainers || repairContainers) && minerType === 'mine' && creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if((constructionContainers || repairContainers) && minerType === 'mine' && !creep.memory.building && (creep.store.getFreeCapacity() == 0) ) {
            creep.memory.building = true;
            creep.say('🔨 build');
        }



        if(!creep.memory.carrying) {



            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                creep.say("⛏ 🔄");
            }
            const mineFlag = Game.flags[creep.memory.firstSpawnCoords + 'MineFlag'];


            if(!!!mineFlag) {
                return;
            }

            // const mineHostiles = mineFlag.room?.find(FIND_HOSTILE_CREEPS, {
            //     filter: (creep) => (creep.getActiveBodyparts(ATTACK) > 0 || creep.getActiveBodyparts(RANGED_ATTACK) > 0 ) && creep.owner.username === 'Invader'
            // }).length;


            // if(mineHostiles) {
            //     if(creep.room != firstRoom) {
            //         creep.say("😨",true)
            //         creep.moveTo(firstRoom.find(FIND_CREEPS)[0])
            //     } else if(mineHostiles){
            //         Carrier.run(creep);
            //     }
            //     return;
            // }


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

            if(minerType !== 'mine' && droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
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

            if(minerType !== 'mine' && droppedT && creep.withdraw(droppedT,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(droppedT, {visualizePathStyle: {stroke: '#ffaa00'}});
                return
            }



            let targetSource = Harvester.findTargetSource(creep);

            if(targetSource && minerType !== 'haul') {
                creep.moveTo(targetSource);
            }


            if(minerType === 'haul') {

                let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= creep.store.getCapacity()
                })

                if(droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
                    creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
                    return;
                }

                if(container && creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: "#ffffff"}});
                } else if(!container && droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE){
                    creep.moveTo(droppedSources, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                return;
            }

            if(minerType === 'mine') {

                const finalSource = creep.pos.findClosestByPath(FIND_SOURCES);

                if(finalSource && !creep.pos.isNearTo(finalSource.pos.x, finalSource.pos.y)) {
                    creep.moveTo(finalSource, {visualizePathStyle: {stroke: '#FFFFFF'}});
                    return;
                }

                if(!finalSource) {
                    return;
                }

                const mineCode = creep.harvest(finalSource);
                if(mineCode == ERR_NOT_IN_RANGE && !creep.pos.isNearTo(finalSource.pos.x, finalSource.pos.y)) {
                    creep.moveTo(finalSource, {visualizePathStyle: {stroke: '#FFFFFF'}});
                }

                if(!constructionContainers && creep.pos.isNearTo(finalSource.pos.x, finalSource.pos.y)) {
                    ScaffoldingUtils.createContainers(creep);
                }

                if(repairContainers && creep.store.energy > 0) {
                    creep.repair(repairContainers)
                }else if(constructionContainers && creep.store.energy > 0) {
                    creep.build(constructionContainers)
                } else if(containers) {
                    creep.transfer(containers,RESOURCE_ENERGY);
                } else {
                    creep.drop(RESOURCE_ENERGY);
                }

                return;
            }

            const finalSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if(finalSource && creep.harvest(finalSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(finalSource, {visualizePathStyle: {stroke: '#FFFFFF'}});
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

