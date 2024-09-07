import { PeaceTimeEconomy } from "./EconomiesUtils";
import { RoomUtils } from "./RoomUtils";

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


const myFriends = [
    'gnat',
    'Xarroc'
];

export class SpawnUtils {
    static SHOW_VISUAL_CREEP_ICONS: boolean = true;
    public static TOTAL_ATTACKER_SIZE = PeaceTimeEconomy.TOTAL_ATTACKER_SIZE * 1;
    public static TOTAL_HEALER_SIZE = PeaceTimeEconomy.TOTAL_HEALER_SIZE * 1;
    public static TOTAL_DISMANTLER_SIZE = PeaceTimeEconomy.TOTAL_DISMANTLER_SIZE *1;
    public static  TOTAL_MEAT_GRINDERS = PeaceTimeEconomy.TOTAL_MEAT_GRINDERS * 1;
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

    public static getBodyPartsForArchetype(archetype: string, spawn: any, commandLevel: number = 1, numberOfNeededTypes:number): Array<BodyPartConstant> | null {
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
                if(Game.flags.hardClaim && energyAvailable >= 1850) {
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 3; i++) {
                        partsPattern.push(CLAIM);
                    }
                    break;
                }
                else if(Game.flags.hardClaim && energyAvailable >= 1250) {
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 2; i++) {
                        partsPattern.push(CLAIM);
                    }
                    break;
                }
                else if(energyAvailable >= 650) {
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(CLAIM);
                    }
                    break;
                } else {
                    return null;
                }

            case 'miner':
                //console.log(`Energy Available in ${spawn.name}:`,energyAvailable);
                if(energyAvailable >= 550) {
                    partsPattern = [MOVE,WORK,WORK,WORK,WORK,WORK];
                    break;
                } else {
                    return null;
                }
            case 'settler':

                if(energyAvailable >= 1800) {
                    for (let i = 0; i < 16; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(CARRY);
                    }
                break;
                }else if(energyAvailable >= 850) {

                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(MOVE);
                    }

                    for (let i = 0; i < 3; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 3; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
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
                    break;
                } else {
                    return null;
                }
            case 'carrier':
                 //console.log(`Energy Available in ${spawn.name}:`,energyAvailable);
                 if(energyAvailable >= (PartCosts.MOVE * 36) + (PartCosts.CARRY * 14)) {
                    for (let i = 0; i < 36; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 14; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                } else if(energyAvailable >= (PartCosts.MOVE * 30) + (PartCosts.CARRY * 12)) {
                    for (let i = 0; i < 3.; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 12; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                } else if(energyAvailable >= (PartCosts.MOVE * 26) + (PartCosts.CARRY * 10)) {
                    for (let i = 0; i < 26; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                } else if( energyAvailable >= (PartCosts.MOVE * 8) + (PartCosts.CARRY * 8)) {
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }
                else if(energyAvailable >= 450) {
                    partsPattern = [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY];
                    break;
                }
                else if(energyAvailable >= 350){
                    partsPattern = [MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY];
                    break;
                }
                else if(energyAvailable >= 250){
                    partsPattern = [MOVE,MOVE,MOVE,CARRY,CARRY];
                    break;
                }
                else {
                    return null;
                }
            case 'harvester':
                  if(energyAvailable >= (PartCosts.MOVE * 4) + (PartCosts.CARRY * 1) + (PartCosts.WORK * 12)) {
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(CARRY);
                    }
                    for (let i = 0; i < 12; i++) {
                        partsPattern.push(WORK);
                    }
                    break;
                }
                else if(energyAvailable >= ((PartCosts.MOVE * 4) + (PartCosts.CARRY * 1) + (PartCosts.WORK * 7))) {
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(CARRY);
                    }

                    for (let i = 0; i < 7; i++) {
                        partsPattern.push(WORK);
                    }
                    break;
                }
                else if(energyAvailable >= 650) {
                    partsPattern = [MOVE,MOVE,CARRY,WORK,WORK,WORK,WORK,WORK];
                    break;
                }
                else if(energyAvailable >= 550) {
                    partsPattern = [MOVE,MOVE,CARRY,WORK,WORK,WORK,WORK];
                    break;
                }
                else if(energyAvailable >= 450) {
                    partsPattern = [MOVE,MOVE,CARRY,WORK,WORK,WORK];
                    break;
                }
                else if(energyAvailable >= 350){
                    partsPattern = [MOVE,MOVE,CARRY,WORK,WORK];
                    break;
                } else if(energyAvailable >= 250){
                    partsPattern = [MOVE,MOVE,CARRY,WORK];
                    break;
                } else {
                    return null;
                }
            case 'upgrader':
                if(energyAvailable >= 2100) {
                    for (let i = 0; i < 6; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 13; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                } else if(energyAvailable >= 1800) {
                    for (let i = 0; i < 6; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 11; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }
                else if(energyAvailable >= 1300) {
                    for (let i = 0; i < 6; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }
                else if(energyAvailable >= 800) {
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }  else if(energyAvailable >= 400) {
                    partsPattern = [MOVE,CARRY,WORK,WORK,WORK];
                    break;
                } else if(energyAvailable >= 300){
                    partsPattern = [MOVE,CARRY,WORK,WORK];
                    break;
                } else if(energyAvailable >= 200){
                    partsPattern = [MOVE,CARRY,WORK];
                    break;
                } else {
                    return null;
                }
            case 'builder':
            case 'repairer':

                if(energyAvailable >= 3500) {
                    for (let i = 0; i < 26; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                } else if(energyAvailable >= 2100) {
                    for (let i = 0; i < 14; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 12; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                } else if(energyAvailable >= 1800) {
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 12; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }
                else if(energyAvailable >= 1300) {
                    for (let i = 0; i < 6; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }
                else if(energyAvailable >= 800) {
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }  else if(energyAvailable >= 400) {
                    partsPattern = [MOVE,CARRY,WORK,WORK,WORK];
                    break;
                } else if(energyAvailable >= 300){
                    partsPattern = [MOVE,CARRY,WORK,WORK];
                    break;
                } else if(energyAvailable >= 200){
                    partsPattern = [MOVE,CARRY,WORK];
                    break;
                } else {
                    return null;
                }
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
                    break;
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
                    break;
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
                    break;
                }
                else if(commandLevel < 5 && energyAvailable >= 450) {
                     partsPattern = [MOVE, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK ];
                     break;
                }
                else {
                    return null;
                }
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
                    break;
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
                    break;
                } else {
                    return null;
                }
            case 'meatGrinder':
                if(energyAvailable >= 1500) {
                    for (let i = 0; i < 25; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 25; i++) {
                        partsPattern.push(MOVE);
                    }
                    break;
                } else {
                    return null;
                }
            case 'attacker':
                if(energyAvailable >= 3040) {

                    for (let i = 0; i < 23; i++) {
                        partsPattern.push(ATTACK);
                    }
                    for (let i = 0; i < 24; i++) {
                        partsPattern.push(MOVE);
                    }
                    break;
                }
                else if(energyAvailable >= 2060) {

                    for (let i = 0; i < 17; i++) {
                        partsPattern.push(ATTACK);
                    }
                    for (let i = 0; i < 3; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 15; i++) {
                        partsPattern.push(MOVE);
                    }
                    break;
                }
                else if(energyAvailable >= 1320) {


                    for (let i = 0; i < 7; i++) {
                        partsPattern.push(ATTACK);
                    }
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 15; i++) {
                        partsPattern.push(MOVE);
                    }
                    break;
                }
                else {
                   return null;
                }
            case 'healer':
                if(energyAvailable >= 6100) {
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(HEAL);
                    }
                    break;
                } else if(energyAvailable >= 3050) {
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 5; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(HEAL);
                    }
                    break;
                } else if(energyAvailable >= 2450) {
                    for (let i = 0; i < 9; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(HEAL);
                    }
                    break;
                } else if(energyAvailable >= 1450) {
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 5; i++) {
                        partsPattern.push(HEAL);
                    }
                    break;
                } else {
                    return null;
                }

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
