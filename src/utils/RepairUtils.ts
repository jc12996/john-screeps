
export class RepairUtils {

    public static buildingRatios(target: Creep | Structure): {
        maxContainerStrength: number,
        maxRoadStrength: number,
        maxRampartStrength: number,
        maxWallStrength: number,
        maxRoadStrengthRepairer: number,
        maxContainerStrengthRepairer: number
    } {
        let maxWallStrength = 1000;
        let maxContainerStrength = 10000;
        let maxRoadStrength = 1000;
        let maxRoadStrengthRepairer = 1000;
        let maxContainerStrengthRepairer = 10000;

        if(target.room.controller && target.room.controller.my && target.room.controller.level > 0) {
            switch(target.room.controller.level) {
                case 3:
                    maxWallStrength = 10000;
                    break;
                case 4:
                    maxWallStrength = 10000;
                    maxRoadStrengthRepairer = 2500;
                    maxContainerStrengthRepairer = 10000;
                    break;
                case 5:
                    maxWallStrength = 100000;
                    maxRoadStrength = 1000;
                    maxRoadStrengthRepairer = 3000;
                    maxContainerStrengthRepairer = 10000;
                    break;
                case 6:
                    maxWallStrength = 200000;
                    maxRoadStrength = 2000;
                    maxRoadStrengthRepairer = 4700;
                    maxContainerStrengthRepairer = 10000;
                    break;
                case 7:
                    maxWallStrength = 1000000;
                    maxRoadStrength = 3000;
                    maxRoadStrengthRepairer = 4800;
                    maxContainerStrengthRepairer = 50000;
                    break;
                case 8:
                    maxWallStrength = 2000000;
                    maxRoadStrength = 4000;
                    maxRoadStrengthRepairer = 4900;
                    maxContainerStrengthRepairer = 50000;
                    break;
            }

            const largeStorages = target.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType === STRUCTURE_STORAGE && structure.store.energy > 900000) || (structure.structureType === STRUCTURE_TERMINAL&& structure.store.energy > 200000))
                }
            });

            if(largeStorages.length > 0 && maxWallStrength < WALL_HITS_MAX) {
                maxWallStrength = WALL_HITS_MAX;
            }


        }

        const maxRampartStrength = maxWallStrength * 0.90;

        return {
            maxContainerStrength,
            maxRoadStrength,
            maxRampartStrength,
            maxWallStrength,
            maxRoadStrengthRepairer,
            maxContainerStrengthRepairer

        }
    }

}
