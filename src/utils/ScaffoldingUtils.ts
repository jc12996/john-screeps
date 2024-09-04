import { spawn } from "child_process";


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

    public static createRoadX(creepOrSpawn: Creep | StructureSpawn, flag: Flag | undefined = undefined): void {
        var spawnsAmount = creepOrSpawn.room.find(FIND_MY_SPAWNS);



        let pos = spawnsAmount[0].pos;
        if(flag) {
            pos = flag.pos;
        }
        if(!pos || !creepOrSpawn.room?.controller?.my) {
            return;
        }

        const roadsMade = creepOrSpawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_ROAD && structure.pos.x == pos.x -1 && structure.pos.y == pos.y+1
        });
        const roadsMadeSites = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => structure.structureType === STRUCTURE_ROAD && structure.pos.x == pos.x -1 && structure.pos.y == pos.y+1
        })
        if(roadsMade.length > 0 || roadsMadeSites.length > 0) {
            return;
        }
        creepOrSpawn.room?.createConstructionSite(pos.x - 1,pos.y+1,STRUCTURE_ROAD);
        creepOrSpawn.room?.createConstructionSite(pos.x - 2,pos.y+2,STRUCTURE_ROAD);
        creepOrSpawn.room?.createConstructionSite(pos.x - 3,pos.y+3,STRUCTURE_ROAD);
        creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y+4,STRUCTURE_ROAD);
        creepOrSpawn.room?.createConstructionSite(pos.x - 5,pos.y+5,STRUCTURE_ROAD);

        creepOrSpawn.room?.createConstructionSite(pos.x - 5,pos.y+1,STRUCTURE_ROAD);
        creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y+2,STRUCTURE_ROAD);
        creepOrSpawn.room?.createConstructionSite(pos.x - 2,pos.y+4,STRUCTURE_ROAD);
        creepOrSpawn.room?.createConstructionSite(pos.x - 1,pos.y+5,STRUCTURE_ROAD);
        creepOrSpawn.room?.createConstructionSite(pos.x,    pos.y+6,STRUCTURE_ROAD);
        creepOrSpawn.room?.createConstructionSite(pos.x - 6,pos.y,STRUCTURE_ROAD);
        creepOrSpawn.room?.createConstructionSite(pos.x - 6,pos.y + 6,STRUCTURE_ROAD);

    }

    public static createExtensions(creepOrSpawn: Creep | StructureSpawn, flag: Flag | undefined = undefined): void {
        var spawnsAmount = creepOrSpawn.room.find(FIND_MY_SPAWNS);

        if(!spawnsAmount[0]) {
            return;
        }

        let pos = spawnsAmount[0].pos;
        if(flag) {
            pos = flag.pos;
        }



        if(creepOrSpawn.room.controller && creepOrSpawn.room.controller.my && spawnsAmount.length === 1) {

            if(creepOrSpawn.room?.controller?.my && creepOrSpawn.room.controller?.level) {


                if (creepOrSpawn.room.controller.level >= 2) {
                    creepOrSpawn.room?.createConstructionSite(pos.x - 3,pos.y +2,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x - 3,pos.y +4,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y +1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y +3,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x  -2,pos.y +1,STRUCTURE_EXTENSION);
                }

                if (creepOrSpawn.room.controller.level >= 3 ) {
                    creepOrSpawn.room?.createConstructionSite(pos.x -4,pos.y+5,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -2,pos.y+5,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -1,pos.y+4,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -1,pos.y+2,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -3,pos.y+5,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -1,pos.y+3,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -3,pos.y+1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -5,pos.y+3,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -5,pos.y+4,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -5,pos.y+2,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-7,pos.y-1,STRUCTURE_TOWER);
                }

                if (creepOrSpawn.room.controller.level >= 4 ) {
                    creepOrSpawn.room?.createConstructionSite(pos.x -6,pos.y+1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -5,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -6,pos.y+5,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -5,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+5,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-4,pos.y,STRUCTURE_TOWER);
                    creepOrSpawn.room?.createConstructionSite(pos.x -1,pos.y,STRUCTURE_STORAGE);//Storage

                }

                const totalNumberOfLinkSites = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES,{
                    filter: (struc: { structureType: string; }) => {
                        return struc.structureType === STRUCTURE_LINK
                    }
                });

                if (creepOrSpawn.room.controller.level >= 5 ) {
                    creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y+4,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-4,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-2,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+4,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y+2,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-7,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-7,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x+1,pos.y+6,STRUCTURE_EXTENSION);

                    if(totalNumberOfLinkSites.length == 0) {
                        creepOrSpawn.room.createFlag(pos.x -2,pos.y+3,creepOrSpawn.room.name+'ExtensionLink');
                        creepOrSpawn.room?.createConstructionSite(pos.x -2,pos.y+3,STRUCTURE_LINK);//ExtensionLink Link
                    }

                }

                if (creepOrSpawn.room.controller.level >= 6 ) {
                    const link = creepOrSpawn.room.find(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType === STRUCTURE_LINK && structure.pos.x == pos.x -2 && structure.pos.y == pos.y+3
                    });
                    const linkSites = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (structure) => structure.structureType === STRUCTURE_LINK && structure.pos.x == pos.x -2 && structure.pos.y == pos.y+3
                    })
                    if(link.length > 0 || linkSites.length > 0) {
                        return;
                    }
                    if(totalNumberOfLinkSites.length == 0) {
                        creepOrSpawn.room.createFlag(pos.x -2,pos.y+3,creepOrSpawn.room.name+'ExtensionLink2');
                        creepOrSpawn.room?.createConstructionSite(pos.x -2,pos.y+3,STRUCTURE_LINK);//ExtensionLink Link
                    }
                }
            }
        }
    }

    public static createContainers(creep: Creep | StructureSpawn): void {
        creep.room.createConstructionSite(creep.pos.x, creep.pos.y,STRUCTURE_CONTAINER);
    }

    public static createBaseWallsAndRamparts(creepOrSpawn: Creep | StructureSpawn, flag: Flag | undefined = undefined): void {
        var spawnsAmount = creepOrSpawn.room.find(FIND_MY_SPAWNS);

        if(!spawnsAmount[0]) {
            return;
        }

        let pos = spawnsAmount[0].pos;
        if(flag) {
            pos = flag.pos;
        }


        if(pos) {

            let startingRightSideY = -2;
            for(let i = 0; i < 11; i++) {

                const sideYCoord = pos.y+startingRightSideY;

                if(i == 1 || i == 2 || i == 9 || i == 10) {
                    creepOrSpawn.room?.createConstructionSite(pos.x+3,sideYCoord,STRUCTURE_RAMPART);

                }else {
                    creepOrSpawn.room?.createConstructionSite(pos.x+3,sideYCoord,STRUCTURE_WALL);
                }

                startingRightSideY++;

            }

            let startingTopSideX = 3;
            for(let i = 0; i < 11; i++) {
                const topXCoord = pos.x+startingTopSideX;
                // const sideTerrain = creepOrSpawn.room.lookAtArea(pos.y-2-1,topXCoord+1,pos.y-2-1,topXCoord-1,true);
                // if(sideTerrain.length && sideTerrain.every((t) => t.terrain == 'wall')){
                //     startingTopSideX--
                //     continue;
                // }
                if(i == 1 || i == 2 || i == 9 || i == 10) {
                    creepOrSpawn.room?.createConstructionSite(topXCoord,pos.y-2,STRUCTURE_RAMPART);
                } else {
                    creepOrSpawn.room?.createConstructionSite(topXCoord,pos.y-2,STRUCTURE_WALL);
                }
                startingTopSideX--;

            }

            let startingBottomSideX = 3;
            for(let i = 0; i < 12; i++) {

                const bottomXCoord = pos.x+startingBottomSideX;
                // const sideTerrain = creepOrSpawn.room.lookAtArea(pos.y-2+1,bottomXCoord+1,pos.y-2-1,bottomXCoord+1,true);
                // if(sideTerrain.length && sideTerrain.every((t) => t.terrain == 'wall')){
                //     startingBottomSideX--;
                //     continue;
                // }
                if( i == 1 || i == 2 || i == 9 || i == 10) {
                    creepOrSpawn.room?.createConstructionSite(bottomXCoord,pos.y+9,STRUCTURE_RAMPART);
                } else {
                    creepOrSpawn.room?.createConstructionSite(bottomXCoord,pos.y+9,STRUCTURE_WALL);
                }
                startingBottomSideX--;

            }

            let startingLefttSideY = -2;
            for(let i = 0; i < 11; i++) {

                if( i == 1 || i == 2 || i == 9 || i == 10) {
                    creepOrSpawn.room?.createConstructionSite(pos.x-8,pos.y+startingLefttSideY,STRUCTURE_RAMPART);
                }else {
                    creepOrSpawn.room?.createConstructionSite(pos.x-8,pos.y+startingLefttSideY,STRUCTURE_WALL);
                }
                startingLefttSideY++;

            }

        }
    }


}
