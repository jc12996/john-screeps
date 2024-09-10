import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";
import { Attacker } from "./attacker";

export class Defender {
    public static run(creep: Creep): void {

        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🛡');
        }

        var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
            }
        });
        var hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) && creep.structureType !== STRUCTURE_CONTROLLER
            }
        });

        var badSpawns = creep.room.find(FIND_HOSTILE_SPAWNS, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
            }

        });

        var hostileActiveTowers = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (tower) => {
                return tower.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(tower.owner) && tower.structureType == STRUCTURE_TOWER && tower.store[RESOURCE_ENERGY] != 0
            }
        });

        const nearestExit = creep.pos.findClosestByPath(FIND_EXIT);

        const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return (flag.color == COLOR_BLUE)
            }
        })

        const mineFlag = Game.flags[creep.memory.firstSpawnCoords+'MineFlag'];
        let firstRoom = null;
        if(creep.memory.firstSpawnCoords) {
            firstRoom = Game.rooms[creep.memory.firstSpawnCoords];
        }


        if(!Game.flags.attackFlag && hostileActiveTowers.length > 0 && nearestExit) {
            creep.moveTo(nearestExit);
        } else if (hostileCreeps.length > 0 || hostileStructures.length > 0 || (badSpawns.length > 0 && hostileStructures.length < 3)) {
            Attacker.run(creep);
        } else if(Game.flags?.draftFlag) {
            MovementUtils.goToFlag(creep,Game.flags?.draftFlag)
        } else if(mineFlag && (mineFlag.room?.find(FIND_HOSTILE_CREEPS) || mineFlag.room?.find(FIND_HOSTILE_STRUCTURES)) && firstRoom && creep.room !== mineFlag.room) {
            MovementUtils.goToFlag(creep,mineFlag);
        } else if(roomRallyPointFlag.length) {
            MovementUtils.goToFlag(creep,roomRallyPointFlag[0])
        } else if(Game.flags?.rallyFlag && !creep.room.find(FIND_FLAGS)) {
            MovementUtils.goToFlag(creep,Game.flags?.rallyFlag)
        } else {

            creep.move(MovementUtils.randomDirectionSelector());
        }
    }
}
