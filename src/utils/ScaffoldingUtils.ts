import { AutoSpawn } from "autospawn";
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
        //creepOrSpawn.room?.createConstructionSite(pos.x - 6,pos.y,STRUCTURE_ROAD);

    }

    public static createExtensionFarm1(creepOrSpawn: Creep | StructureSpawn): void {
        var spawnsAmount = creepOrSpawn.room.find(FIND_MY_SPAWNS);

        if(!spawnsAmount.length) {
            return;
        }

        let pos = spawnsAmount[0].pos;

        if(creepOrSpawn.room.controller && creepOrSpawn.room.controller.my && spawnsAmount.length >= 1) {

            ScaffoldingUtils.createRoadX(creepOrSpawn);

            if(!Game.flags[creepOrSpawn.room.name+'NoWalls']) {
                ScaffoldingUtils.createBaseWallsAndRamparts(creepOrSpawn);
            }

            if(creepOrSpawn.room?.controller?.my && creepOrSpawn.room.controller?.level) {


                if (creepOrSpawn.room.controller.level == 2) {
                    creepOrSpawn.room?.createConstructionSite(pos.x - 7,pos.y +1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y +1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y +3,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x  -2,pos.y +1,STRUCTURE_EXTENSION);
                }

                if (creepOrSpawn.room.controller.level == 3 ) {
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
                    creepOrSpawn.room?.createConstructionSite(pos.x-3,pos.y-2,STRUCTURE_TOWER);
                }

                if (creepOrSpawn.room.controller.level == 4 ) {
                    creepOrSpawn.room?.createConstructionSite(pos.x -6,pos.y+1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -5,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -6,pos.y+5,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -5,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+5,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-3,pos.y+4,STRUCTURE_TOWER);
                    creepOrSpawn.room?.createConstructionSite(pos.x -1,pos.y,STRUCTURE_STORAGE);//Storage

                }

                if (creepOrSpawn.room.controller.level == 5 ) {
                    //none
                }

                if(creepOrSpawn.room.controller.level == 6) {
                    creepOrSpawn.room?.createConstructionSite(pos.x-2,pos.y,STRUCTURE_LAB);
                    creepOrSpawn.room?.createConstructionSite(pos.x-3,pos.y,STRUCTURE_LAB);
                    creepOrSpawn.room?.createConstructionSite(pos.x-4,pos.y,STRUCTURE_LAB);
                }

                if(creepOrSpawn.room.controller.level == 7) {
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+2,STRUCTURE_LAB);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+3,STRUCTURE_LAB);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+4,STRUCTURE_LAB);
                    creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y+6,STRUCTURE_FACTORY);
                }


            }
        }
    }

    public static createExtensionFarm2(creepOrSpawn: Creep | StructureSpawn, totalSpawns:number, flag: Flag): void {
        const totalNumberOfLinkSites = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES,{
            filter: (struc: { structureType: string; }) => {
                return struc.structureType === STRUCTURE_LINK
            }
        });

        var spawnsAmount = creepOrSpawn.room.find(FIND_MY_SPAWNS);

        if(!spawnsAmount.length || !flag) {
            return;
        }

        const pos =  flag.pos;


        if(creepOrSpawn.room.controller && creepOrSpawn.room.controller.my && spawnsAmount.length >= 1) {

            ScaffoldingUtils.createRoadX(creepOrSpawn,flag);




            if (creepOrSpawn.room.controller.level == 5 ) {


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

            if (creepOrSpawn.room.controller.level == 6 ) {
                if(totalNumberOfLinkSites.length == 0) {
                    creepOrSpawn.room.createFlag(pos.x -2,pos.y+3,creepOrSpawn.room.name+'ExtensionLink2');
                    creepOrSpawn.room?.createConstructionSite(pos.x -2,pos.y+3,STRUCTURE_LINK);//ExtensionLink Link
                }
                const terminalConstructionSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (rampart) => {
                        return (rampart.structureType == STRUCTURE_TERMINAL)
                    }
                });
                if(terminalConstructionSite.length == 0 && creepOrSpawn.room?.controller?.my) {
                    creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y,STRUCTURE_TERMINAL);
                }


            }

            if (creepOrSpawn.room.controller.level == 7 ) {
                creepOrSpawn.room?.createConstructionSite(pos.x,pos.y,STRUCTURE_SPAWN, 'Spawn'+(totalSpawns + 1));



                //console.log('Creating Controller Link',creepOrSpawn.room.name)
                if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x -1,creepOrSpawn?.room?.controller.pos.y,STRUCTURE_LINK) == OK){
                    creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x -1,creepOrSpawn?.room?.controller.pos.y,creepOrSpawn.room.name+'ControllerLink1');
                } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x +1,creepOrSpawn?.room?.controller.pos.y,STRUCTURE_LINK) == OK){
                    creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x +1,creepOrSpawn?.room?.controller.pos.y,creepOrSpawn.room.name+'ControllerLink1');
                } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x,creepOrSpawn?.room?.controller.pos.y +1,STRUCTURE_LINK) == OK){
                    creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x,creepOrSpawn?.room?.controller.pos.y +1,creepOrSpawn.room.name+'ControllerLink1');
                } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x,creepOrSpawn?.room?.controller.pos.y -1,STRUCTURE_LINK) == OK){
                    creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x,creepOrSpawn?.room?.controller.pos.y -1,creepOrSpawn.room.name+'ControllerLink1');
                }  else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x+1,creepOrSpawn?.room?.controller.pos.y -1,STRUCTURE_LINK) == OK){
                    creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x+1,creepOrSpawn?.room?.controller.pos.y -1,creepOrSpawn.room.name+'ControllerLink1');
                } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x+1,creepOrSpawn?.room?.controller.pos.y +1,STRUCTURE_LINK) == OK){
                    creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x+1,creepOrSpawn?.room?.controller.pos.y +1,creepOrSpawn.room.name+'ControllerLink1');
                } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x-1,creepOrSpawn?.room?.controller.pos.y -1,STRUCTURE_LINK) == OK){
                    creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x-1,creepOrSpawn?.room?.controller.pos.y -1,creepOrSpawn.room.name+'ControllerLink1');
                } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x-1,creepOrSpawn?.room?.controller.pos.y +1,STRUCTURE_LINK) == OK){
                    creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x-1,creepOrSpawn?.room?.controller.pos.y +1,creepOrSpawn.room.name+'ControllerLink1');
                }



            }

            if (creepOrSpawn.room.controller.level == 8 ) {
                // Walls on 2nd extension here when hit level 8
                if(!Game.flags[creepOrSpawn.room.name+'NoWalls']) {
                    ScaffoldingUtils.createBaseWallsAndRamparts(creepOrSpawn,flag);
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

                if(i == 2 || i == 9) {
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
                if(i == 2 || i == 9) {
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
                if( i == 2 || i == 9) {
                    creepOrSpawn.room?.createConstructionSite(bottomXCoord,pos.y+9,STRUCTURE_RAMPART);
                } else {
                    creepOrSpawn.room?.createConstructionSite(bottomXCoord,pos.y+9,STRUCTURE_WALL);
                }
                startingBottomSideX--;

            }

            let startingLefttSideY = -2;
            for(let i = 0; i < 11; i++) {

                if(i == 2 || i == 9) {
                    creepOrSpawn.room?.createConstructionSite(pos.x-8,pos.y+startingLefttSideY,STRUCTURE_RAMPART);
                }else {
                    creepOrSpawn.room?.createConstructionSite(pos.x-8,pos.y+startingLefttSideY,STRUCTURE_WALL);
                }
                startingLefttSideY++;

            }

        }
    }


}
