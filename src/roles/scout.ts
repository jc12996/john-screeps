import { MovementUtils } from "utils/MovementUtils";
import { Defender } from "./defender";
import { SpawnUtils } from "utils/SpawnUtils";

export class Scout {

    public static run(creep: Creep): void {




        const scouts = _.filter(Game.creeps, creep => creep.memory.role == "scout");

        if(Game.flags['1'] && scouts.length >= 1 && creep.name === scouts[0].name) {
            creep.moveTo(Game.flags['1']);
            creep.say('👀1');
            return;
        }

        if(Game.flags['1'] && Game.flags['2'] && scouts.length >= 2 && creep.name !== scouts[0].name) {

            if(creep.room === Game.flags['1'].room) {
                creep.memory.scoutCheckpointNumber = 1;
            }

            if(!creep.memory.scoutCheckpointNumber) {
                creep.say('👀1');
                creep.moveTo(Game.flags['1']);
            }

            if(creep.memory.scoutCheckpointNumber === 1) {
                creep.say('👀2');
                creep.moveTo(Game.flags['2']);
            }

            if(Game.flags['1'] && Game.flags['2'] && Game.flags['3'] && scouts.length >= 3 && creep.name !== scouts[0].name && creep.name !== scouts[1].name) {

                if(creep.room === Game.flags['2'].room) {
                    creep.memory.scoutCheckpointNumber = 2;
                }

                if(!creep.memory.scoutCheckpointNumber) {
                    creep.say('👀2');
                    creep.moveTo(Game.flags['2']);
                }

                if(creep.memory.scoutCheckpointNumber === 2) {
                    creep.say('👀3');
                    creep.moveTo(Game.flags['3']);
                }

                return;
            }


            return;
        }

        creep.say('👀',true);
        MovementUtils.defaultArmyMovement(creep,Game.flags.rallyFlag);


    }

}

