

export class ScaffoldingUtils {

    public static createSpawn(creep: Creep | StructureSpawn,nextClaimFlag:Flag,totalSpawns:number): void {
        var spawnConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (rampart) => {
                return (rampart.structureType == STRUCTURE_SPAWN)
            }
        });


        if(spawnConstructionSites.length == 0 && creep.room?.controller?.my && !!nextClaimFlag?.name) {
            creep.room?.createConstructionSite(nextClaimFlag.pos.x,nextClaimFlag.pos.y,STRUCTURE_SPAWN, 'Spawn'+(totalSpawns + 1));
            console.log('Creating '+ 'Spawn'+(totalSpawns + 1))
        }
    }

    public static createRoadX(creep: Creep | StructureSpawn): void {
        var spawnsAmount = creep.room.find(FIND_MY_SPAWNS);

        if(creep.room.controller && creep.room.controller.my && spawnsAmount.length === 1) {

            //Draw an X of roads
            if(spawnsAmount && creep.room?.controller?.my && spawnsAmount[0].pos) {
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 1,spawnsAmount[0].pos.y+1,STRUCTURE_ROAD);
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 2,spawnsAmount[0].pos.y+2,STRUCTURE_ROAD);
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 3,spawnsAmount[0].pos.y+3,STRUCTURE_ROAD);
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 4,spawnsAmount[0].pos.y+4,STRUCTURE_ROAD);
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 5,spawnsAmount[0].pos.y+5,STRUCTURE_ROAD);

                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 5,spawnsAmount[0].pos.y+1,STRUCTURE_ROAD);
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 4,spawnsAmount[0].pos.y+2,STRUCTURE_ROAD);
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 2,spawnsAmount[0].pos.y+4,STRUCTURE_ROAD);
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 1,spawnsAmount[0].pos.y+5,STRUCTURE_ROAD);
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x,spawnsAmount[0].pos.y+6,STRUCTURE_ROAD);
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 6,spawnsAmount[0].pos.y,STRUCTURE_ROAD);
                creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 6,spawnsAmount[0].pos.y + 6,STRUCTURE_ROAD);
            }
        }
    }

    public static createExtensions(creep: Creep | StructureSpawn): void {
        var spawnsAmount = creep.room.find(FIND_MY_SPAWNS);

        if(creep.room.controller && creep.room.controller.my && spawnsAmount.length === 1) {

            if(creep.room?.controller?.my && creep.room.controller?.level) {
                if (creep.room.controller.level >= 2) {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 3,spawnsAmount[0].pos.y +2,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 3,spawnsAmount[0].pos.y +4,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 4,spawnsAmount[0].pos.y +1,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x - 4,spawnsAmount[0].pos.y +3,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x  -2,spawnsAmount[0].pos.y +1,STRUCTURE_EXTENSION);
                }

                if (creep.room.controller.level >= 3 ) {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -4,spawnsAmount[0].pos.y+5,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -2,spawnsAmount[0].pos.y+5,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -1,spawnsAmount[0].pos.y+4,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -1,spawnsAmount[0].pos.y+2,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -3,spawnsAmount[0].pos.y+5,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -1,spawnsAmount[0].pos.y+3,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -3,spawnsAmount[0].pos.y+1,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -5,spawnsAmount[0].pos.y+3,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -5,spawnsAmount[0].pos.y+4,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -5,spawnsAmount[0].pos.y+2,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-7,spawnsAmount[0].pos.y-1,STRUCTURE_TOWER);
                }

                if (creep.room.controller.level >= 4 ) {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -6,spawnsAmount[0].pos.y+1,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -5,spawnsAmount[0].pos.y,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -6,spawnsAmount[0].pos.y+5,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -5,spawnsAmount[0].pos.y+6,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x,spawnsAmount[0].pos.y+5,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-4,spawnsAmount[0].pos.y,STRUCTURE_TOWER);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -1,spawnsAmount[0].pos.y,STRUCTURE_STORAGE);//Storage

                }

                if (creep.room.controller.level >= 5 ) {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x -2,spawnsAmount[0].pos.y+3,STRUCTURE_LINK);//ExtensionLink Link
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-1,spawnsAmount[0].pos.y+6,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-6,spawnsAmount[0].pos.y+4,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-4,spawnsAmount[0].pos.y+6,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-2,spawnsAmount[0].pos.y+6,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x,spawnsAmount[0].pos.y+4,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-6,spawnsAmount[0].pos.y+2,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-1,spawnsAmount[0].pos.y,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x,spawnsAmount[0].pos.y+1,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-7,spawnsAmount[0].pos.y+6,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-7,spawnsAmount[0].pos.y,STRUCTURE_EXTENSION);
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x+1,spawnsAmount[0].pos.y+6,STRUCTURE_EXTENSION);

                    creep.room.createFlag(spawnsAmount[0].pos.x -2,spawnsAmount[0].pos.y+3,creep.room.name+'ExtensionLink');
                }
            }
        }
    }

    public static createContainers(creep: Creep | StructureSpawn): void {
        creep.room.createConstructionSite(creep.pos.x, creep.pos.y,STRUCTURE_CONTAINER);
    }

    public static createBaseWallsAndRamparts(creep: Creep | StructureSpawn): void {
        var spawnsAmount = creep.room.find(FIND_MY_SPAWNS);
        if(spawnsAmount.length) {

            let startingRightSideY = -2;
            for(let i = 0; i < 11; i++) {


                if(i == 1) {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x+3,spawnsAmount[0].pos.y+startingRightSideY,STRUCTURE_RAMPART);
                }else {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x+3,spawnsAmount[0].pos.y+startingRightSideY,STRUCTURE_WALL);
                }

                startingRightSideY++;

            }

            let startingTopSideX = 3;
            for(let i = 0; i < 11; i++) {
                if(i == 2 || i == 11) {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x+startingTopSideX,spawnsAmount[0].pos.y-2,STRUCTURE_RAMPART);
                } else {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x+startingTopSideX,spawnsAmount[0].pos.y-2,STRUCTURE_WALL);
                }
                startingTopSideX--;

            }

            let startingBottomSideX = 3;
            for(let i = 0; i < 12; i++) {
                if( i == 2 || i == 10) {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x+startingBottomSideX,spawnsAmount[0].pos.y+9,STRUCTURE_RAMPART);
                } else {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x+startingBottomSideX,spawnsAmount[0].pos.y+9,STRUCTURE_WALL);
                }
                startingBottomSideX--;

            }

            let startingLefttSideY = -2;
            for(let i = 0; i < 11; i++) {
                if(i == 1) {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-8,spawnsAmount[0].pos.y+startingLefttSideY,STRUCTURE_RAMPART);
                } else {
                    creep.room?.createConstructionSite(spawnsAmount[0].pos.x-8,spawnsAmount[0].pos.y+startingLefttSideY,STRUCTURE_WALL);
                }


                startingLefttSideY++;

            }

        }
    }


}
