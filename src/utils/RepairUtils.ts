
export class RepairUtils {

    public static buildingRatios(target: Creep | Structure): {
        maxContainerStrength: number,
        maxRoadStrength: number,
        maxRampartStrength: number,
        maxWallStrength: number
    } {
        let maxWallStrength = 10000;
        let maxContainerStrength = 50000;
        let maxRoadStrength = 100;

        if(target.room.controller && target.room.controller.my && target.room.controller.level > 0) {
            switch(target.room.controller.level) {
                case 5:
                    maxWallStrength = 100000;
                    maxRoadStrength = 500;
                    break;
                case 6:
                    maxWallStrength = 200000;
                    maxRoadStrength = 1000;
                    break;
                case 7:
                    maxWallStrength = 300000;
                    maxRoadStrength = 4000;
                    break;
                case 8:
                    maxWallStrength = 1000000;
                    maxRoadStrength = 4000;
                    break;
            }

        }

        const maxRampartStrength = maxWallStrength * 0.90;

        return {
            maxContainerStrength,
            maxRoadStrength,
            maxRampartStrength,
            maxWallStrength

        }
    }

}
