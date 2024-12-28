import { Builder } from "./builder";
import { AutoSpawn } from "autospawn";
import { Repairer } from "./repairer";
import { Harvester } from "./harvester";
import { SpawnUtils } from "utils/SpawnUtils";
import { MovementUtils } from "utils/MovementUtils";
import { Carrier } from "./carrier";
import { Upgrader } from "./upgrader";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import { Miner } from "./miner";

export class Settler {



    public static run(creep: Creep): void {




        if(!creep.memory.settled) {
            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                creep.say("🌎");
            }
            const canProceed = MovementUtils.claimerSettlerMovementSequence(creep);
            if(!canProceed){
                return;
            }
        }

        if(!creep.memory.settled) {
            creep.memory.settled = true;
        }

        var spawns = creep.room.find(FIND_MY_SPAWNS);

        if(creep.room.controller?.my && spawns.length === 0) {
            ScaffoldingUtils.createSpawn(creep,AutoSpawn.nextClaimFlag,AutoSpawn.totalSpawns);
        }

        if(creep.memory.delivering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.delivering = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.delivering && creep.store.getFreeCapacity() == 0) {
            creep.memory.delivering = true;
            creep.say('🌎 settle');
        }

        if(!creep.memory.delivering) {
            // const harvesters = _.filter(
            //     Game.creeps,
            //     creep => creep.memory.role == "harvester" && spawns[0] && creep.room.name == spawns[0].room.name
            //   );
            // if(harvesters.length >= 3) {
            //     MovementUtils.generalGatherMovement(creep);
            // } else {
                Harvester.run(creep);
            //}
            return;
        }

        creep.memory.targetSource = undefined;
        if(!creep.memory.settled) {
            creep.memory.settled = true;
        }

        let mySettleRoom = undefined;
        if(spawns.length) {
            mySettleRoom = spawns[0].room;
        }

        this.settlerSequence(creep, mySettleRoom);

        if(Game.flags.settlerFlag && spawns.length > 0 && mySettleRoom && mySettleRoom.controller && mySettleRoom.controller.level >= 3) {
            Game.flags.settlerFlag.remove();
        }
    }

    private static settlerSequence(creep:Creep, room: Room | undefined = undefined) {
        if(creep.room?.controller && creep.room?.controller.my && (creep.room?.controller.level < 2 || (creep.room.controller?.ticksToDowngrade && creep.room.controller.ticksToDowngrade < 2000) || creep.memory.upgrading)
        ) {

            const moveCode = creep.upgradeController(creep.room.controller);
            creep.say("⚡ upgrade");
            if((creep.room.controller?.ticksToDowngrade && creep.room.controller.ticksToDowngrade >= 6000) || !creep.room.controller?.ticksToDowngrade) {
                creep.memory.upgrading = false;
            } else {
                creep.memory.upgrading = true;
            }
            if(!creep.pos.inRangeTo(creep.room.controller.pos.x, creep.room.controller.pos.y, 3) && moveCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#ffffff" } });
            }

        } else if (room && room.energyAvailable < room.energyCapacityAvailable && room.find(FIND_STRUCTURES, { filter:(struc) => struc.structureType === STRUCTURE_EXTENSION}).length >= 5) {
            Carrier.run(creep);
        } else {
            Builder.run(creep)
        }
    }

}

