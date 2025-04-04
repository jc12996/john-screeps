import { sendEnergyFromOriginSpawn, transferEnergyToOriginSpawn } from "links";
import { Nukers } from "nukers";
import { handleRamparts } from "ramparts";
import { Tower } from "tower";
import { SpawnUtils } from "./SpawnUtils";
import { PeaceTimeEconomy, SeigeEconomy, WarTimeEconomy } from "./EconomiesUtils";

export class RoomUtils {

    public static run() {

        sendEnergyFromOriginSpawn();

        for (var room_it in Game.rooms) {
            const room: Room = Game.rooms[room_it];
            var spawn = room.find(FIND_MY_SPAWNS)[0];
            if (!spawn) {
                continue;
            }

            if(Game.flags.removeWallSites) {
                this.removeSites(room,STRUCTURE_WALL);
                Game.flags.removeWallSites.remove();
            }

            if(Game.flags.removeRoadSites) {
                this.removeSites(room,STRUCTURE_ROAD);
                Game.flags.removeRoadSites.remove();
            }

            handleRamparts({ room: room });
            transferEnergyToOriginSpawn(room);
            this.safeModeProtections(room);

            Tower.defendMyRoom(room);

            if (room.controller?.my && room.controller.level === 8) {
                Nukers.awaitingNuke(room);
            }
            }
            if (Game?.flags?.rallyFlag?.room && Game.time % 7) {
                const rallyLocationHasHostiles = Game.flags.rallyFlag.room.find(FIND_HOSTILE_CREEPS, {
                    filter: ccc => {
                    return ccc.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(ccc.owner);
                    }
                });
                const rallyLocationHasHostileStructs = Game.flags.rallyFlag.room.find(FIND_HOSTILE_STRUCTURES, {
                    filter: ccc => {
                    return ccc.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(ccc.owner) && ccc.structureType !== STRUCTURE_CONTROLLER;
                    }
                });

                if (rallyLocationHasHostiles?.length || rallyLocationHasHostileStructs?.length) {
                    SpawnUtils.TOTAL_ATTACKER_SIZE = WarTimeEconomy.TOTAL_ATTACKER_SIZE;
                    SpawnUtils.TOTAL_HEALER_SIZE = WarTimeEconomy.TOTAL_HEALER_SIZE;
                    SpawnUtils.TOTAL_DISMANTLER_SIZE = WarTimeEconomy.TOTAL_DISMANTLER_SIZE;
                    SpawnUtils.TOTAL_MEAT_GRINDERS = WarTimeEconomy.TOTAL_MEAT_GRINDERS;
                    Memory.economyType = "war";
                } else if (Game.flags.seigeFlag) {
                    SpawnUtils.TOTAL_ATTACKER_SIZE = SeigeEconomy.TOTAL_ATTACKER_SIZE;
                    SpawnUtils.TOTAL_HEALER_SIZE = SeigeEconomy.TOTAL_HEALER_SIZE;
                    SpawnUtils.TOTAL_DISMANTLER_SIZE = SeigeEconomy.TOTAL_DISMANTLER_SIZE;
                    SpawnUtils.TOTAL_MEAT_GRINDERS = SeigeEconomy.TOTAL_MEAT_GRINDERS;
                    Memory.economyType = "seige";
                } else {
                    SpawnUtils.TOTAL_ATTACKER_SIZE = PeaceTimeEconomy.TOTAL_ATTACKER_SIZE;
                    SpawnUtils.TOTAL_HEALER_SIZE = PeaceTimeEconomy.TOTAL_HEALER_SIZE;
                    SpawnUtils.TOTAL_DISMANTLER_SIZE = PeaceTimeEconomy.TOTAL_DISMANTLER_SIZE;
                    SpawnUtils.TOTAL_MEAT_GRINDERS = PeaceTimeEconomy.TOTAL_MEAT_GRINDERS;
                    Memory.economyType = "peace";
                }
            }
    }

    private static safeModeProtections(room: Room):void {

        if (room.controller && room.controller.safeModeAvailable === 0) {
            return;
        }

        const playerHostiles = room.find(FIND_HOSTILE_CREEPS, {
            filter: hostileCreep => {
            return (
                hostileCreep.owner &&
                !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner) &&
                hostileCreep.getActiveBodyparts(ATTACK) > 0
            );
            }
        });

        const commandLevel = room.controller?.level ?? 1;
        if (commandLevel <= 6 && playerHostiles.length > 0 && room.controller?.my) {

        let safeTower = room.find(FIND_STRUCTURES, {
          filter: structure => {
            return (
              structure.structureType == STRUCTURE_TOWER &&
              structure.room?.controller?.my &&
              structure.store[RESOURCE_ENERGY] > 0
            );
          }
        })[0] ?? null;

        if(!safeTower) {
          room.controller.activateSafeMode();
        }
        let nukes = room.find(FIND_NUKES);
        for (let nuke of nukes) {
            // Check if the nuke is within 1000 ticks of landing
            let nukeImpactTime = nuke.timeToLand; // ticks until nuke hits
            if (nukeImpactTime <= 1000) {
                // Check if it's safe to activate Safe Mode
                if (room.controller.safeModeAvailable > 0 && !room.controller.safeMode) {
                    console.log(`Activating safe mode in room ${room.name} due to nuke impact.`);
                    room.controller.activateSafeMode();
                }
            }
        }

      }
    }

    private static removeSites(room:Room, structureTypeConstant:StructureConstant):void {

        const wallSites = room.find(FIND_CONSTRUCTION_SITES,{
            filter:(site) => {
                return site.structureType === structureTypeConstant
            }
        });
        for(const wallSite of wallSites) {
            wallSite.remove();
        }


    }

    public static getCreepProspectingSlots(target: Source | StructureController): Array<{
        x: number,
        y: number,
        numberOfPlainSlots: number
    }> {

        const pos = target.pos;
        const top = { x: pos.x, y: pos.y + 1, numberOfPlainSlots: 0 };
        const topLeft = { x: pos.x -1 , y: pos.y + 1, numberOfPlainSlots: 0 };
        const topRight = { x: pos.x +1 , y: pos.y + 1, numberOfPlainSlots: 0 };
        const right = { x: pos.x +1 , y: pos.y, numberOfPlainSlots: 0 };
        const left = { x: pos.x +1 , y: pos.y, numberOfPlainSlots: 0 };
        const bottom = { x: pos.x , y: pos.y -1, numberOfPlainSlots: 0 };
        const bottomLeft = { x: pos.x-1 , y: pos.y -1, numberOfPlainSlots: 0 };
        const bottomRight = { x: pos.x+1 , y: pos.y -1, numberOfPlainSlots: 0 };

        const squareAreas = [top,topLeft,topRight,right,left,bottom,bottomLeft,bottomRight];

        for(const area of squareAreas) {
            const areaPostion: Terrain[] = target.room.lookForAt(LOOK_TERRAIN,area.x,area.y);
            const hasCreep = target.room.lookForAt(LOOK_CREEPS,area.x,area.y);
            if((areaPostion.includes('plain') || areaPostion.includes('swamp')) && hasCreep.length == 0) {
                area.numberOfPlainSlots++;
            }
        }

        return squareAreas.filter((area) => area.numberOfPlainSlots > 0);
    }

    public static getTotalAmountOfProspectingSlotsInRoomBySpawnOrFlag(target: StructureSpawn | Flag): number {

        if(!target || target === undefined || !target.room || target?.room === undefined) {
            return 0;
        }

        let room = target.room;

        const sources = room.find(FIND_SOURCES);


        let total = 0;

        for(const source of sources) {
            const prospectingAreas = this.getCreepProspectingSlots(source)
            for(const area of prospectingAreas) {
                if(area.numberOfPlainSlots > 0) {
                    total = total + area.numberOfPlainSlots;
                }
            }
        }



        return total;

    }

}
