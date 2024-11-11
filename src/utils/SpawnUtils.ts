import { PeaceTimeEconomy, SquadEconomy } from "./EconomiesUtils";
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
    'Xarroc',
    'legendeck',
    'Matticus',
    'dreamlane',
    'legendeck',
    'kailin-limble',
    'Redfro',
    'Matticus',
    'Source Keeper'
];
// Starter Base for Bot Season 10/2024 - W7S4

export class SpawnUtils {
    static SHOW_VISUAL_CREEP_ICONS: boolean = true;
    public static TOTAL_ATTACKER_SIZE = Game.flags.SquadFlag ? SquadEconomy.TOTAL_ATTACKER_SIZE * 1 : PeaceTimeEconomy.TOTAL_ATTACKER_SIZE * 1;
    public static TOTAL_HEALER_SIZE = Game.flags.SquadFlag ? SquadEconomy.TOTAL_HEALER_SIZE * 1 : PeaceTimeEconomy.TOTAL_HEALER_SIZE * 1;
    public static TOTAL_DISMANTLER_SIZE = Game.flags.SquadFlag ? SquadEconomy.TOTAL_DISMANTLER_SIZE * 1 : PeaceTimeEconomy.TOTAL_DISMANTLER_SIZE *1;
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
        let patternCost = 0;
        const energyAvailable = spawn.room.energyAvailable;

        switch(archetype) {

            case 'attackClaimer':
            case 'claimer':
                if(energyAvailable >= 650) {
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
            case 'settler':
                const lowerMiner = commandLevel < 7 || (commandLevel >= 7 && energyAvailable < 1000)
                if(commandLevel >= 7 && energyAvailable >= 2900) {

                    for (let i = 0; i < 21; i++) {
                        partsPattern.push(MOVE);
                    }

                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 21; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }else if(lowerMiner && energyAvailable >= 850) {

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
                }
                else if(lowerMiner &&energyAvailable >= 400) {

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
                }
                else if(lowerMiner && energyAvailable >= 300) {

                    for (let i = 0; i < 2; i++) {
                        partsPattern.push(MOVE);
                    }

                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 2; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }

                else {
                    return null;
                }
            case 'carrier':
                if(commandLevel >= 8 && energyAvailable >= (PartCosts.MOVE * 25) + (PartCosts.CARRY * 25)) {
                    for (let i = 0; i < 25; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 25; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }
                else if(commandLevel >= 6 && energyAvailable >= (PartCosts.MOVE * 10) + (PartCosts.CARRY * 10)) {
                    for (let i = 0; i < 10; i++) {
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
                if(energyAvailable >= ((PartCosts.MOVE * 2) + (PartCosts.CARRY * 1) + (PartCosts.WORK * 6))) {
                    for (let i = 0; i < 2; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 1; i++) {
                        partsPattern.push(CARRY);
                    }

                    for (let i = 0; i < 6; i++) {
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

                if(commandLevel == 7 && energyAvailable >= 1300) {
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 9; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }
                else if(commandLevel <= 7 && energyAvailable >= 800) {
                    for (let i = 0; i < 2; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 6; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 2; i++) {
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
                if(commandLevel >= 8 && energyAvailable >= 2900) {
                    for (let i = 0; i < 15; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 8; i++) {
                        partsPattern.push(WORK);
                    }
                    for (let i = 0; i < 27; i++) {
                        partsPattern.push(CARRY);
                    }
                    break;
                }
                else if(commandLevel >= 7 && energyAvailable >= 1300) {
                    for (let i = 0; i < 4; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 9; i++) {
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
                if(commandLevel == 8 && Game.flags.draftFlag && energyAvailable >= 2800) {

                    for (let i = 0; i < 40; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(ATTACK);
                    }

                    break;
                }
                else if(energyAvailable >= 2000) {
                    for (let i = 0; i < 24; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(ATTACK);
                    }
                    break;
                } else if(energyAvailable >= 1500) {

                    for (let i = 0; i < 14; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 10; i++) {
                        partsPattern.push(ATTACK);
                    }
                    break;
                }  else if(energyAvailable >= 770) {

                    for (let i = 0; i < 9; i++) {
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
            case 'meatGrinder':
                if(energyAvailable >= 1100) {
                    for (let i = 0; i < 5; i++) {
                        partsPattern.push(TOUGH);
                    }
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(MOVE);
                    }
                    break;
                } else {
                    return null;
                }
            case 'healer':
                if(energyAvailable >= 3000) {
                    for (let i = 0; i < 25; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 7; i++) {
                        partsPattern.push(HEAL);
                    }
                    break;
                } else {
                    return null;
                }
            case 'attacker':
                if(energyAvailable >= 3250) {

                    for (let i = 0; i < 25; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 25; i++) {
                        partsPattern.push(ATTACK);
                    }

                    break;
                }
                else {
                   return null;
                }
            case 'scout':
                if(energyAvailable >= 2500) {

                    for (let i = 0; i < 50; i++) {
                        partsPattern.push(MOVE);
                    }

                    break;
                }
                else {
                    return null;
                }
            case 'dismantler':
                if(energyAvailable >= 3100) {
                    for (let i = 0; i < 22; i++) {
                        partsPattern.push(MOVE);
                    }
                    for (let i = 0; i < 20; i++) {
                        partsPattern.push(WORK);
                    }
                    break;
                }
                else {
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
