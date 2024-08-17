import { EconomiesUtils } from "./EconomiesUtils";

export enum PartCosts {
    TOUGH = 10,
    ATTACK = 80,
    MOVE = 50,
    WORK = 100,
    CARRY = 50,
    RANGED_ATTACK = 150,
    HEAL = 250,
    CLAIM = 600


}


const myFriends = ['kailin-limble','DonkeyKong', 'Xarroc'];

export class SpawnUtils {
    static SHOW_VISUAL_CREEP_ICONS: boolean = false;
    public static FRIENDLY_OWNERS_FILTER(owner: Owner | undefined): boolean {
        if(!owner) {
            return false;
        }
        return myFriends.includes(owner.username);
    }
    /*
    * Returns an array of BodyPartConstants for a given archetype, and available energy.
    * TODO: make this more single responsibility by removing the available energy logic.
    * TODO: Make this more typesafe by using a type for archetype instead of a string.
    * TODO: Use factory pattern or something to get rid of the switch statements. For example, each role can be required to describe it's parts pattern.
    */

    public static getBodyPartsForArchetype(archetype: string, spawn: any, commandLevel: number = 1): Array<BodyPartConstant> | null {
        let partsPattern = new Array<BodyPartConstant>();
        let bodyParts = new Array<BodyPartConstant>();
        let defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender' && spawn.room.name == creep.room.name);
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && spawn.room.name == creep.room.name);
        let carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && spawn.room.name == creep.room.name);
        let patternCost = 0;
        const energyAvailable = spawn.room.energyAvailable;
        const RoomSources = spawn.room.find(FIND_SOURCES);

        switch(archetype) {
            case 'claimer':
                if(energyAvailable >= (PartCosts.CLAIM * 3) + (PartCosts.MOVE * 3)) {
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 3; i++) {
                        partsPattern.push(CLAIM);
                    }
                }
                else if(energyAvailable >= (PartCosts.CLAIM * 2) + (PartCosts.MOVE * 1)) {
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 2; i++) {
                        partsPattern.push(CLAIM);
                    }
                } else if(commandLevel < 4 && energyAvailable >= (PartCosts.CLAIM * 1) + (PartCosts.MOVE * 1)) {
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(CLAIM);
                    }
                } else {
                    return null;
                }

                break;

            case 'miner':
                //console.log(`Energy Available in ${spawn.name}:`,energyAvailable);
                if(energyAvailable >= 550) {
                    partsPattern = [MOVE,WORK,WORK,WORK,WORK,WORK];
                } else {
                    return null;
                }

                break;
            case 'settler':
                if(energyAvailable >= 850) {

                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(MOVE);
                    }

                    for (let i = 0; i < 3; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 3; i++) {
                        partsPattern.push(CARRY);
                    }
                } else if(energyAvailable >= 400) {

                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(MOVE);
                    }

                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 2; i++) {
                        partsPattern.push(CARRY);
                    }
                } else {
                    return null;
                }


                break;
            case 'carrier':
                 //console.log(`Energy Available in ${spawn.name}:`,energyAvailable);
                 if((commandLevel < 9 || carriers.length < (EconomiesUtils.Carrier * RoomSources.length)) && energyAvailable >= (PartCosts.MOVE * 40) + (PartCosts.CARRY * 10)) {
                    for (let i = 0; i < 40; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(CARRY);
                    }
                } else if((commandLevel == 7 || carriers.length < (EconomiesUtils.Carrier * RoomSources.length)) && energyAvailable >= (PartCosts.MOVE * 30) + (PartCosts.CARRY * 10)) {
                    for (let i = 0; i < 30; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(CARRY);
                    }
                } else if((commandLevel >= 6 || carriers.length < (EconomiesUtils.Carrier * RoomSources.length)) &&energyAvailable >= (PartCosts.MOVE * 26) + (PartCosts.CARRY * 10)) {
                    for (let i = 0; i < 26; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(CARRY);
                    }
                }
                else if((commandLevel >= 5 || carriers.length < (EconomiesUtils.Carrier * RoomSources.length)) && energyAvailable >= (PartCosts.MOVE * 16) + (PartCosts.CARRY * 10)) {
                    for (let i = 0; i < 16; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(CARRY);
                    }
                }
                else if((commandLevel >= 4 || carriers.length < (EconomiesUtils.Carrier * RoomSources.length)) && energyAvailable >= (PartCosts.MOVE * 6) + (PartCosts.CARRY * 10)) {
                    for (let i = 0; i < 6; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(CARRY);
                    }
                } else if((commandLevel >= 3 || carriers.length < (EconomiesUtils.Carrier * RoomSources.length)) && energyAvailable >= 450) {
                    partsPattern = [MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];
                } else if((commandLevel < 3 || carriers.length < (EconomiesUtils.Carrier * RoomSources.length)) && energyAvailable > 200){
                    partsPattern = [MOVE,CARRY,CARRY,CARRY];
                } else {
                    return null;
                }
                break;
            case 'harvester':
                //console.log(`Energy Available in ${spawn.name}:`,energyAvailable);

                if((commandLevel >= 3 || harvesters.length < (EconomiesUtils.Harvester * RoomSources.length)) && energyAvailable >= ((PartCosts.MOVE * 2) + (PartCosts.CARRY * 2) + (PartCosts.WORK * 6))) {
                    for (let i = 0; i < 2; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 2; i++) {
                        partsPattern.push(CARRY);
                    }
                    for (let i = 0; i < 6; i++) {
                        partsPattern.push(WORK);
                    }
                } else if((commandLevel < 3 || harvesters.length < (EconomiesUtils.Harvester * RoomSources.length)) && energyAvailable >= 450) {
                    partsPattern = [MOVE,CARRY,CARRY,WORK,WORK,WORK];
                } else if((commandLevel < 3 || harvesters.length < (EconomiesUtils.Harvester * RoomSources.length)) && energyAvailable > 200){
                    partsPattern = [MOVE,WORK,CARRY];
                } else {
                    return null;
                }
                break;
            case 'builder':
            case 'repairer':
            case 'upgrader':

                //console.log(`Energy Available in ${spawn.name}:`,energyAvailable);
                if(energyAvailable >= 3500) {
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(CARRY);
                    }
                } else if(energyAvailable >= 2000) {
                    for (let i = 0; i < 9; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 11; i++) {
                        partsPattern.push(CARRY);
                    }
                } else if(energyAvailable >= 1800) {
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 9; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(CARRY);
                    }
                }
                else if(energyAvailable >= 1300) {
                    for (let i = 0; i < 6; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 6; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(CARRY);
                    }
                }
                else if(energyAvailable >= (PartCosts.MOVE * 4) + (PartCosts.WORK * 4) + (PartCosts.CARRY * 4)) {
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(CARRY);
                    }
                } else if(energyAvailable >= 450) {
                    partsPattern = [MOVE,MOVE,MOVE,WORK,WORK,CARRY,CARRY];
                } else if(energyAvailable > 200){
                    partsPattern = [MOVE,WORK,CARRY];
                } else {
                    return null;
                }

                break;
            case 'defender':

                if(energyAvailable >= 2000) {
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 22; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(ATTACK);
                    }
                } else if(energyAvailable >= 1500) {

                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 12; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(ATTACK);
                    }
                }  else if(energyAvailable >= 800) {

                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(ATTACK);
                    }
                }
                else if(commandLevel < 5 && energyAvailable >= 450) {
                     partsPattern = [MOVE, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, ATTACK ];
                }
                else {
                    return null;
                }

                break;

            case 'dismantler':

                if(energyAvailable >= 3100) {
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(WORK);
                    }
                } else if(energyAvailable >= 1300) {
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 7; i++) {
                        partsPattern.push(WORK);
                    }
                } else {
                    return null;
                }

                break;
            case 'meatGrinder':

                if(energyAvailable >= 830) {
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 25; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(ATTACK);
                    }
                } else {
                    return null;
                }
                break;
            case 'attacker':
                if(energyAvailable >= 2700) {
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 28; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 15; i++) {
                        partsPattern.push(ATTACK);
                    }
                } else if(energyAvailable >= 1350) {
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 12; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(ATTACK);
                    }
                }
                else {
                   return null;
                }
                break;
            case 'healer':
                if(energyAvailable >= ((PartCosts.MOVE * 20) + (PartCosts.TOUGH * 10) + (PartCosts.HEAL * 20))) {
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(HEAL);
                    }
                } else if(energyAvailable >= 1350) {
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 3; i++) {
                        partsPattern.push(HEAL);
                    }
                } else {
                    return null;
                }
                break;

        }

        partsPattern.forEach((pattern) => {
            if(pattern == TOUGH) {
                patternCost += PartCosts.TOUGH;
            }

            if(pattern == ATTACK) {
                patternCost += PartCosts.ATTACK;
            }

            if(pattern == MOVE) {
                patternCost += PartCosts.MOVE;
            }

            if(pattern == WORK) {
                patternCost += PartCosts.WORK;
            }

            if(pattern == CARRY) {
                patternCost += PartCosts.CARRY;
            }

            if(pattern == RANGED_ATTACK) {
                patternCost += PartCosts.RANGED_ATTACK;
            }

            if(pattern == HEAL) {
                patternCost += PartCosts.HEAL;
            }

            if(pattern == CLAIM) {
                patternCost += PartCosts.CLAIM;
            }

        });

        for (let partIndex = 0; partIndex < partsPattern.length; partIndex++) {

            bodyParts.push(partsPattern[partIndex]);

        }

        return bodyParts;


    }
}
