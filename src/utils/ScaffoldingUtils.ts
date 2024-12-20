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


    public static createRoadX(creepOrSpawn: Creep | StructureSpawn, flag: Flag | undefined = undefined, roomPos?:RoomPosition): void {
        var spawnsAmount = creepOrSpawn.room.find(FIND_MY_SPAWNS);



        let pos = spawnsAmount[0].pos;
        if(flag) {
            pos = flag.pos;
        }
        if(roomPos) {
            pos = roomPos;
        }
        if(!pos || !creepOrSpawn.room?.controller?.my) {
            return;
        }

        const hasRoads = creepOrSpawn.room.find(FIND_STRUCTURES, {
            filter: (extension) => {
                extension.structureType === STRUCTURE_ROAD && extension.pos.x == pos.x-3 && extension.pos.y == pos.y+3
            }
        }).length > 0;


        if(!hasRoads) {
            creepOrSpawn.room?.createConstructionSite(pos.x - 1,pos.y+1,STRUCTURE_ROAD);
            creepOrSpawn.room?.createConstructionSite(pos.x - 2,pos.y+2,STRUCTURE_ROAD);
            creepOrSpawn.room?.createConstructionSite(pos.x - 3,pos.y+3,STRUCTURE_ROAD);
            creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y+4,STRUCTURE_ROAD);
            creepOrSpawn.room?.createConstructionSite(pos.x - 5,pos.y+5,STRUCTURE_ROAD);

            creepOrSpawn.room?.createConstructionSite(pos.x - 5,pos.y+1,STRUCTURE_ROAD);
            creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y+2,STRUCTURE_ROAD);
            creepOrSpawn.room?.createConstructionSite(pos.x - 2,pos.y+4,STRUCTURE_ROAD);
            creepOrSpawn.room?.createConstructionSite(pos.x - 1,pos.y+5,STRUCTURE_ROAD);
        }


    }

    public static createExtensionFarm1(creepOrSpawn: Creep | StructureSpawn): void {
        var spawnsAmount = creepOrSpawn.room.find(FIND_MY_SPAWNS);

        if(!spawnsAmount.length) {
            return;
        }

        let pos = spawnsAmount[0].pos;

        if(creepOrSpawn.room.controller && creepOrSpawn.room.controller.my && spawnsAmount.length >= 1) {

            ScaffoldingUtils.createRoadX(creepOrSpawn);

            if(Game.flags[creepOrSpawn.room.name+'HasWalls']) {
                ScaffoldingUtils.createBaseWallsAndRamparts(creepOrSpawn);
            }

            if(creepOrSpawn.room?.controller?.my && creepOrSpawn.room.controller?.level) {


                if (creepOrSpawn.room.controller.level >= 2) {
                    const hasLevelExtensions = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (extension) => {
                            extension.structureType === STRUCTURE_EXTENSION && extension.pos.x == pos.x-6 && extension.pos.y == pos.y+1
                        }
                    }).length > 0;
                    if(!hasLevelExtensions) {
                        creepOrSpawn.room?.createConstructionSite(pos.x - 6,pos.y +1,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y +1,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x - 4,pos.y +3,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x  -2,pos.y +1,STRUCTURE_EXTENSION);
                    }

                }

                if (creepOrSpawn.room.controller.level >= 3 ) {
                    const hasLevelTower = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (extension) => {
                            extension.structureType === STRUCTURE_TOWER && extension.pos.x == pos.x-3 && extension.pos.y == pos.y+2
                        }
                    }).length > 0;
                    if(!hasLevelTower) {
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
                        creepOrSpawn.room?.createConstructionSite(pos.x-3,pos.y+2,STRUCTURE_TOWER);

                    }

                }

                if (creepOrSpawn.room.controller.level >= 4 ) {
                    const hasLevelStorageSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (extension) => {
                            extension.structureType === STRUCTURE_STORAGE && extension.pos.x == pos.x-1 && extension.pos.y == pos.y
                        }
                    }).length > 0;
                    const hasLevelStorage = creepOrSpawn.room.find(FIND_STRUCTURES, {
                        filter: (extension) => {
                            extension.structureType === STRUCTURE_STORAGE && extension.pos.x == pos.x-1 && extension.pos.y == pos.y
                        }
                    }).length > 0;
                    if(!hasLevelStorage && !hasLevelStorageSite) {
                        creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y+6,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y+4,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x-4,pos.y+6,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+4,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y+2,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x-5,pos.y,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y+7,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x-7,pos.y+6,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x-7,pos.y,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x+1,pos.y+6,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x -6,pos.y+1,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x -5,pos.y,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x -6,pos.y+5,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x -5,pos.y+6,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+5,STRUCTURE_EXTENSION);
                        creepOrSpawn.room?.createConstructionSite(pos.x-3,pos.y+4,STRUCTURE_TOWER);
                        creepOrSpawn.room?.createConstructionSite(pos.x -1,pos.y,STRUCTURE_STORAGE);//Storage
                    }
                }

                if (creepOrSpawn.room.controller.level >= 5 ) {
                    const totalNumberOfLinkSites = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES,{
                        filter: (struc: { structureType: string; }) => {
                            return struc.structureType === STRUCTURE_LINK
                        }
                    });

                    if(totalNumberOfLinkSites.length == 0) {
                        creepOrSpawn.room.createFlag(pos.x -2,pos.y+3,creepOrSpawn.room.name+'ExtensionLink');
                        creepOrSpawn.room?.createConstructionSite(pos.x -2,pos.y+3,STRUCTURE_LINK);//ExtensionLink Link
                    }
                }


                if(creepOrSpawn.room.controller.level === 8) {
                    var hasPowerSpawnSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_POWER_SPAWN)
                        }
                    }).length == 1;

                    var hasPowerSpawn = creepOrSpawn.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_POWER_SPAWN)
                        }
                    }).length == 1;

                    if(!hasPowerSpawn && !hasPowerSpawnSite) {
                        creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+3,STRUCTURE_POWER_SPAWN);
                    }

                    var hasObserverSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_OBSERVER)
                        }
                    }).length == 1;

                    var hasObserver = creepOrSpawn.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_OBSERVER)
                        }
                    }).length == 1;

                    if(!hasObserverSite && !hasObserver) {
                        creepOrSpawn.room?.createConstructionSite(pos.x+2,pos.y+3,STRUCTURE_OBSERVER);
                    }

                    var hasNukerSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_NUKER)
                        }
                    }).length == 1;

                    var hasNuker = creepOrSpawn.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_NUKER)
                        }
                    }).length == 1;

                    if(!hasNukerSite && !hasNuker) {
                        creepOrSpawn.room?.createConstructionSite(pos.x+2,pos.y+2,STRUCTURE_NUKER);
                    }

                    var hasFactorySite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_FACTORY)
                        }
                    }).length == 1;

                    var hasFactory = creepOrSpawn.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_FACTORY)
                        }
                    }).length == 1;

                    if(!hasFactorySite && !hasFactory) {
                        creepOrSpawn.room?.createConstructionSite(pos.x+2,pos.y+1,STRUCTURE_FACTORY);
                    }

                    const hasLevelTower = creepOrSpawn.room.find(FIND_STRUCTURES, {
                        filter: (extension) => {
                            extension.structureType === STRUCTURE_TOWER && extension.pos.x == pos.x-2 && extension.pos.y == pos.y+3
                        }
                    }).length > 0;
                    const hasLevelTowerSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (extension) => {
                            extension.structureType === STRUCTURE_TOWER && extension.pos.x == pos.x-2 && extension.pos.y == pos.y+3
                        }
                    }).length > 0;
                    if(!hasLevelTower && !hasLevelTowerSite) {
                        creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+2,STRUCTURE_TOWER);
                        creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+7,STRUCTURE_TOWER);
                        creepOrSpawn.room?.createConstructionSite(pos.x-2,pos.y+3,STRUCTURE_TOWER);
                    }
                }


            }
        }
    }

    public static createLabFarm(creepOrSpawn: Creep | StructureSpawn, flag: Flag) {
        // 4 by 4 lab square
        const pos =  flag.pos;

        var spawnsAmount = creepOrSpawn.room.find(FIND_MY_SPAWNS);

        if(!spawnsAmount.length || !flag) {
            return;
        }


        const hasRoads = creepOrSpawn.room.find(FIND_STRUCTURES, {
            filter: (extension) => {
                extension.structureType === STRUCTURE_ROAD && extension.pos.x == pos.x && extension.pos.y == pos.y+1
            }
        }).length > 0;


        if(!hasRoads) {
            creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+1,STRUCTURE_ROAD);
            creepOrSpawn.room?.createConstructionSite(pos.x - 1,pos.y+2,STRUCTURE_ROAD);
            creepOrSpawn.room?.createConstructionSite(pos.x + 1,pos.y,STRUCTURE_ROAD);
            creepOrSpawn.room?.createConstructionSite(pos.x + 2,pos.y-1,STRUCTURE_ROAD);
        }

        if(creepOrSpawn.room.controller && creepOrSpawn.room.controller.my && spawnsAmount.length >= 1) {
            if (creepOrSpawn.room.controller.level >= 6 ) {
                const hasLevelLabs = creepOrSpawn.room.find(FIND_STRUCTURES, {
                    filter: (lab) => {
                        lab.structureType === STRUCTURE_LAB && lab.pos.x == pos.x && lab.pos.y == pos.y
                    }
                }).length > 0;

                if(!hasLevelLabs) {
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y,STRUCTURE_LAB);//Input Lab
                    creepOrSpawn.room?.createConstructionSite(pos.x+1,pos.y+1,STRUCTURE_LAB);// Input Lab
                    creepOrSpawn.room?.createConstructionSite(pos.x+1,pos.y-1,STRUCTURE_LAB);// Output Lab
                }
            }

            if (creepOrSpawn.room.controller.level >= 7 ) {
                const hasLevelLabs = creepOrSpawn.room.find(FIND_STRUCTURES, {
                    filter: (lab) => {
                        lab.structureType === STRUCTURE_LAB && lab.pos.x == pos.x && lab.pos.y == pos.y-1
                    }
                }).length > 0;

                if(!hasLevelLabs) {
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y-1,STRUCTURE_LAB);// Output Lab
                    creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y,STRUCTURE_LAB);// Output Lab
                    creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y+1,STRUCTURE_LAB);// Output Lab

                }
            }

            if (creepOrSpawn.room.controller.level >= 8 ) {
                const hasLevelLabs = creepOrSpawn.room.find(FIND_STRUCTURES, {
                    filter: (lab) => {
                        lab.structureType === STRUCTURE_LAB && lab.pos.x == pos.x+2 && lab.pos.y == pos.y
                    }
                }).length > 0;

                if(!hasLevelLabs) {
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+2,STRUCTURE_LAB);// Output Lab
                    creepOrSpawn.room?.createConstructionSite(pos.x+1,pos.y+2,STRUCTURE_LAB);// Output Lab
                    creepOrSpawn.room?.createConstructionSite(pos.x+2,pos.y+1,STRUCTURE_LAB);// Output Lab
                    creepOrSpawn.room?.createConstructionSite(pos.x+2,pos.y,STRUCTURE_LAB);// Output Lab
                }
            }
        }
    }

    public static createExtensionFarm2(creepOrSpawn: Creep | StructureSpawn, flag: Flag): void {
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




            if (creepOrSpawn.room.controller.level >= 5 ) {


                const hasLevelExtensions = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (extension) => {
                        extension.structureType === STRUCTURE_EXTENSION && extension.pos.x == pos.x-1 && extension.pos.y == pos.y+6
                    }
                }).length > 0;

                if(!hasLevelExtensions) {
                    creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y+4,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-4,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+4,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y+2,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-5,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x+1,pos.y+5,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-7,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-7,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x+1,pos.y+6,STRUCTURE_EXTENSION);
                }




            }

            if (creepOrSpawn.room.controller.level >= 6 ) {
                if(totalNumberOfLinkSites.length == 0) {
                    creepOrSpawn.room.createFlag(pos.x -2,pos.y+3,creepOrSpawn.room.name+'ExtensionLink2');
                    creepOrSpawn.room?.createConstructionSite(pos.x -2,pos.y+3,STRUCTURE_LINK);//ExtensionLink Link
                }
                const hasTerminals = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (rampart) => {
                        return (rampart.structureType == STRUCTURE_TERMINAL)
                    }
                }).length > 0;

                const hasLevelExtensions = creepOrSpawn.room.find(FIND_STRUCTURES, {
                    filter: (extension) => {
                        extension.structureType === STRUCTURE_EXTENSION && extension.pos.x == pos.x-4 && extension.pos.y == pos.y+5
                    }
                }).length > 0;
                const hasLevelExtensionsSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (extension) => {
                        extension.structureType === STRUCTURE_EXTENSION && extension.pos.x == pos.x-4 && extension.pos.y == pos.y+5
                    }
                }).length > 0;

                if(!hasLevelExtensions && !hasLevelExtensionsSite) {
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
                }

                const mineralSource = creepOrSpawn.room.find(FIND_MINERALS);

                if(mineralSource.length > 0) {
                    const mineralExtractor = creepOrSpawn.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_EXTRACTOR
                        }
                    })
                    if(mineralExtractor.length === 0) {
                        creepOrSpawn.room?.createConstructionSite(mineralSource[0].pos.x,mineralSource[0].pos.y,STRUCTURE_EXTRACTOR);
                    }
                }


                if(!hasTerminals && creepOrSpawn.room?.controller?.my) {
                    creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y,STRUCTURE_TERMINAL);
                }

                const hasControllerLinkFlag = creepOrSpawn.room.find(FIND_FLAGS, {
                    filter: (flag) => {
                        flag.name === creepOrSpawn.room.name+'ControllerLink1';
                    }
                });

                const hasControllerLinkSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (struc) => {
                        hasControllerLinkFlag[0] && struc.structureType === STRUCTURE_LINK && struc.pos.x === hasControllerLinkFlag[0].pos.x && struc.pos.y === hasControllerLinkFlag[0].pos.y;
                    }
                }).length > 0;

                const hasControllerLink = creepOrSpawn.room.find(FIND_STRUCTURES, {
                    filter: (struc) => {
                        hasControllerLinkFlag[0] && struc.structureType === STRUCTURE_LINK && struc.pos.x === hasControllerLinkFlag[0].pos.x && struc.pos.y === hasControllerLinkFlag[0].pos.y;
                    }
                }).length > 0;


                if(!hasControllerLinkSite && !hasControllerLink&& !hasControllerLinkFlag) {
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



            }

            if (creepOrSpawn.room.controller.level >= 7 ) {


                var hasSecondSpawn = creepOrSpawn.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN)
                    }
                }).length == 2;

                if(!hasSecondSpawn) {

                    const spawns = _.filter(Game.spawns, (spawn) => { return spawn.owner.username === 'Xarroc' });


                    const newSpawnName = 'Spawn'+(spawns.length + 1);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y,STRUCTURE_SPAWN, newSpawnName);
                }

                const hasLevelTower = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (extension) => {
                        extension.structureType === STRUCTURE_TOWER && extension.pos.x == pos.x-3 && extension.pos.y == pos.y+2
                    }
                }).length > 0;
                if(!hasLevelTower) {
                    creepOrSpawn.room?.createConstructionSite(pos.x-3,pos.y+2,STRUCTURE_TOWER);
                }

                const hasLevelExtensions = creepOrSpawn.room.find(FIND_STRUCTURES, {
                    filter: (extension) => {
                        extension.structureType === STRUCTURE_EXTENSION && extension.pos.x == pos.x-4 && extension.pos.y == pos.y
                    }
                }).length > 0;
                const hasLevelExtensionsSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (extension) => {
                        extension.structureType === STRUCTURE_EXTENSION && extension.pos.x == pos.x-4 && extension.pos.y == pos.y
                    }
                }).length > 0;

                if(!hasLevelExtensions && !hasLevelExtensionsSite) {
                    creepOrSpawn.room?.createConstructionSite(pos.x -4,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -4,pos.y+1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -4,pos.y+3,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -3,pos.y+4,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x -6,pos.y+1,STRUCTURE_EXTENSION);
                }



            }

            if (creepOrSpawn.room.controller.level == 8 ) {

                const hasLevelExtensionsSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (extension) => {
                        extension.structureType === STRUCTURE_EXTENSION && extension.pos.x == pos.x && extension.pos.y == pos.y+6
                    }
                }).length > 0;

                const hasLevelExtensions = creepOrSpawn.room.find(FIND_STRUCTURES, {
                    filter: (extension) => {
                        extension.structureType === STRUCTURE_EXTENSION && extension.pos.x == pos.x && extension.pos.y == pos.y+6
                    }
                }).length > 0;

                if(!hasLevelExtensions && !hasLevelExtensionsSite) {


                    creepOrSpawn.room?.createConstructionSite(pos.x-1,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y+4,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-4,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+4,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y+2,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-5,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-7,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-7,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x+1,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-2,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y-1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-5,pos.y-1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-7,pos.y+1,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y+5,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-6,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-5,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+6,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-2,pos.y,STRUCTURE_EXTENSION);
                    creepOrSpawn.room?.createConstructionSite(pos.x-2,pos.y+1,STRUCTURE_EXTENSION);
                }
                // Walls on 2nd extension here when hit level 8
                if(Game.flags[creepOrSpawn.room.name+'HasWalls']) {
                   ScaffoldingUtils.createBaseWallsAndRamparts(creepOrSpawn,flag);
                }

                var hasThirdSpawn = creepOrSpawn.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN)
                    }
                }).length == 3;

                if(!hasThirdSpawn) {

                    const spawns = _.filter(Game.spawns, (spawn) => { return spawn.owner.username === 'Xarroc' });


                    const newSpawnName = 'Spawn'+(spawns.length + 1);
                    creepOrSpawn.room?.createConstructionSite(pos.x,pos.y+2,STRUCTURE_SPAWN, newSpawnName);
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
