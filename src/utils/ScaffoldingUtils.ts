export type ScaffoldPosition = {
    position: RoomPosition,
    type:string,
    farmNumber: number,

};


export class ScaffoldingUtils {

    public static createSpawn(creep: Creep | StructureSpawn,nextClaimFlag:Flag): void {
        var spawnConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (rampart) => {
                return (rampart.structureType == STRUCTURE_SPAWN)
            }
        });

        let totalSpawns = 0;
        for(const spawn in Game.spawns) {
            totalSpawns++;
        }
        if(spawnConstructionSites.length == 0 && creep.room?.controller?.my && !!nextClaimFlag?.name) {
            creep.room?.createConstructionSite(nextClaimFlag.pos.x,nextClaimFlag.pos.y,STRUCTURE_SPAWN, 'Spawn'+(totalSpawns + 1));
            console.log('Creating '+ 'Spawn'+(totalSpawns + 1))
        }
    }

    public static createExtensionFarm1(creepOrSpawn: Creep | StructureSpawn): void {
        var spawnsAmount = creepOrSpawn.room.find(FIND_MY_SPAWNS);

        if(!spawnsAmount.length) {
            return;
        }

        if(creepOrSpawn.room.controller && creepOrSpawn.room.controller.my && spawnsAmount.length >= 1) {


            if(Game.flags[creepOrSpawn.room.name+'HasWalls']) {
                ScaffoldingUtils.createBaseWallsAndRamparts(creepOrSpawn);
            }

        }
    }


    public static createExtensionFarm2(creepOrSpawn: Creep | StructureSpawn, flag: Flag): void {


        var spawnsAmount = creepOrSpawn.room.find(FIND_MY_SPAWNS);

        if(!spawnsAmount.length || !flag) {
            return;
        }

        const pos =  flag.pos;


        if(creepOrSpawn.room.controller && creepOrSpawn.room.controller.my && spawnsAmount.length >= 1) {

            if (creepOrSpawn.room.controller.level >= 6 ) {

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



                // const hasControllerLinkFlag = creepOrSpawn.room.find(FIND_FLAGS, {
                //     filter: (flag) => {
                //         flag.name === creepOrSpawn.room.name+'ControllerLink1';
                //     }
                // });

                // const hasControllerLinkSite = creepOrSpawn.room.find(FIND_CONSTRUCTION_SITES, {
                //     filter: (struc) => {
                //         hasControllerLinkFlag[0] && struc.structureType === STRUCTURE_LINK && struc.pos.x === hasControllerLinkFlag[0].pos.x && struc.pos.y === hasControllerLinkFlag[0].pos.y;
                //     }
                // }).length > 0;

                // const hasControllerLink = creepOrSpawn.room.find(FIND_STRUCTURES, {
                //     filter: (struc) => {
                //         hasControllerLinkFlag[0] && struc.structureType === STRUCTURE_LINK && struc.pos.x === hasControllerLinkFlag[0].pos.x && struc.pos.y === hasControllerLinkFlag[0].pos.y;
                //     }
                // }).length > 0;


                // if(!hasControllerLinkSite && !hasControllerLink&& !hasControllerLinkFlag) {
                //     if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x -1,creepOrSpawn?.room?.controller.pos.y,STRUCTURE_LINK) == OK){
                //         creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x -1,creepOrSpawn?.room?.controller.pos.y,creepOrSpawn.room.name+'ControllerLink1');
                //     } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x +1,creepOrSpawn?.room?.controller.pos.y,STRUCTURE_LINK) == OK){
                //         creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x +1,creepOrSpawn?.room?.controller.pos.y,creepOrSpawn.room.name+'ControllerLink1');
                //     } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x,creepOrSpawn?.room?.controller.pos.y +1,STRUCTURE_LINK) == OK){
                //         creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x,creepOrSpawn?.room?.controller.pos.y +1,creepOrSpawn.room.name+'ControllerLink1');
                //     } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x,creepOrSpawn?.room?.controller.pos.y -1,STRUCTURE_LINK) == OK){
                //         creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x,creepOrSpawn?.room?.controller.pos.y -1,creepOrSpawn.room.name+'ControllerLink1');
                //     }  else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x+1,creepOrSpawn?.room?.controller.pos.y -1,STRUCTURE_LINK) == OK){
                //         creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x+1,creepOrSpawn?.room?.controller.pos.y -1,creepOrSpawn.room.name+'ControllerLink1');
                //     } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x+1,creepOrSpawn?.room?.controller.pos.y +1,STRUCTURE_LINK) == OK){
                //         creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x+1,creepOrSpawn?.room?.controller.pos.y +1,creepOrSpawn.room.name+'ControllerLink1');
                //     } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x-1,creepOrSpawn?.room?.controller.pos.y -1,STRUCTURE_LINK) == OK){
                //         creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x-1,creepOrSpawn?.room?.controller.pos.y -1,creepOrSpawn.room.name+'ControllerLink1');
                //     } else if(creepOrSpawn.room?.createConstructionSite(creepOrSpawn?.room?.controller.pos.x-1,creepOrSpawn?.room?.controller.pos.y +1,STRUCTURE_LINK) == OK){
                //         creepOrSpawn.room.createFlag(creepOrSpawn?.room?.controller.pos.x-1,creepOrSpawn?.room?.controller.pos.y +1,creepOrSpawn.room.name+'ControllerLink1');
                //     }

                // }



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




            }

            if (creepOrSpawn.room.controller.level == 8 ) {


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

    // Function to visualize the extension placements based on the provided string layout
    public static visualizeExtensionPlacement(flag:Flag,extraFarm:boolean = false) {

        const flagPos = flag.pos;

        if(!!!flag) {
            return;
        }

        // Define the string layout
        let layout = `
-REEER
OERTRE
-RSRLE
XERTRE
EREEER
`;
        if(!flag.room) {
            return;
        }
        const room = Game.rooms[flag.room.name]
        if(!flagPos) {
            return;
        }
        const roomPosition: RoomPosition | null = room.getPositionAt(flagPos.x,flagPos.y);
        if(!roomPosition) {
            return;
        }

        let roomLevel = 1;
        if(room.controller && room.controller.my) {
            roomLevel = room.controller.level;
        }
        // Parse the layout into positions for the extensions
        let farmNumber = 1;
        if(flag.color === COLOR_PURPLE) {
            farmNumber = 2;
            layout = `
-REEER
FERTRE
-RPRLE
NERTRE
EREEER
`;
        }
        if(flag.color === COLOR_BROWN) {
            farmNumber = 3;
            layout = `
-RBB-
-BRBB
-BBRB
--BBR
`;
        }

        if(extraFarm) {
            farmNumber = 2;
            layout = `
-REEER
EERQRE
-REREE
EERQRE
EREEER
`;
        }
        const extensionPositions = this.getExtensionPositionsFromLayout(roomPosition, layout,farmNumber);

        // Draw circles at each extension position
        extensionPositions.reverse().forEach(pos => {
            let strokeColor = 'green';
            if(pos.position.lookFor(LOOK_CONSTRUCTION_SITES).length === 0 && pos.position.lookFor(LOOK_STRUCTURES).length === 0) {
                if(Game.time % 7) {
                    if (roomLevel >= 4 && flag.color === COLOR_PURPLE) {
                        this.createConstructionSites(pos,roomLevel)
                    }
                    if(flag.name.includes('claimFlag')) {
                        this.createConstructionSites(pos,roomLevel)
                    }

                    if (roomLevel >= 6 && flag.color === COLOR_BROWN) {
                        this.createConstructionSites(pos,roomLevel)
                    }
                }
                strokeColor = 'red';
            }
            if(pos.position.lookFor(LOOK_STRUCTURES).length === 0) {
                if(pos.type === 'R'){
                    strokeColor = 'yellow';
                }
                this.showBuildingAbbreviations(room,pos);
                room.visual.circle(pos.position, {
                    fill: 'transparent',
                    stroke: strokeColor,
                    radius: 0.5
                });
            }
        });
    }

    private static showBuildingAbbreviations(room:Room,pos:ScaffoldPosition) {
        if(pos.type !== '-') {
            let buildingAbb = pos.type;
            if(pos.type === 'Q'|| pos.type === 'T') {
                buildingAbb = 'To';
            }
            if(pos.type === 'P') {
                buildingAbb = 'Te';
            }
            if(pos.type === 'W') {
                buildingAbb = 'Sp';
            }
            if(pos.type === 'X') {
                buildingAbb = 'Pow';
            }
            if(pos.type === 'L') {
                buildingAbb = 'Li';
            }
            if(pos.type === 'O') {
                buildingAbb = 'Ob';
            }
            if(pos.type === 'L') {
                buildingAbb = 'Li';
            }
            if(pos.type === 'F') {
                buildingAbb = 'Fa';
            }
            if(pos.type === 'N') {
                buildingAbb = 'Nu';
            }
            if(pos.type === 'B') {
                buildingAbb = 'La';
            }
            room.visual.text(buildingAbb,pos.position, {
                font:0.4,
                opacity: 0.8
              });
        }
    }


    private static createConstructionSites(pos: ScaffoldPosition,roomLevel: number) {
        switch(pos.type) {
            case 'E':
                pos.position.createConstructionSite(STRUCTURE_EXTENSION)
                break;
            case 'Q':
                if(roomLevel === 8 && pos.type === 'Q') {
                    pos.position.createConstructionSite(STRUCTURE_TOWER)
                }
                break;
            case 'T':
                pos.position.createConstructionSite(STRUCTURE_TOWER)
                break;
            case 'U':
                pos.position.createConstructionSite(STRUCTURE_CONTAINER)
                break;
            case 'L':
                if(pos.farmNumber == 1 && !Game.flags[pos.position.roomName+'ExtensionLink'] && roomLevel >= 5) {
                    pos.position.createFlag(pos.position.roomName+'ExtensionLink');
                    pos.position.createConstructionSite(STRUCTURE_LINK)
                }
                if(pos.farmNumber == 2 && !Game.flags[pos.position.roomName+'ExtensionLink2'] && roomLevel >= 6) {
                    pos.position.createFlag(pos.position.roomName+'ExtensionLink2');
                    pos.position.createConstructionSite(STRUCTURE_LINK)
                }
                break;
            case 'R':
                pos.position.createConstructionSite(STRUCTURE_ROAD)
                break;
            case 'P':
                pos.position.createConstructionSite(STRUCTURE_TERMINAL)
                break;
            case 'S':
                pos.position.createConstructionSite(STRUCTURE_STORAGE)
                break;
            case 'W':
                pos.position.createConstructionSite(STRUCTURE_SPAWN)
                break;
            case 'F':
                if(roomLevel >= 7) {
                    pos.position.createConstructionSite(STRUCTURE_FACTORY)
                }
                break;
            case 'O':
                if(roomLevel === 8) {
                    pos.position.createConstructionSite(STRUCTURE_OBSERVER)
                }
                break;
            case 'N':
                if(roomLevel === 8) {
                    pos.position.createConstructionSite(STRUCTURE_POWER_SPAWN)
                }
                break;
            case 'X':
                if(roomLevel === 8) {
                    pos.position.createConstructionSite(STRUCTURE_POWER_SPAWN)
                }
                break;
            case 'B':
                if(roomLevel >= 6) {
                    pos.position.createConstructionSite(STRUCTURE_LAB)
                }
                break;
            default:
                break;
        }
    }

    // Function to parse the layout string and return positions of extensions
    private static getExtensionPositionsFromLayout(flagPos: RoomPosition, layout: string, farmNumber: number) {
        const positions: Array<{position:RoomPosition,type:string,farmNumber:number}> = [];
        const rows = layout.split('\n');  // Split layout by line breaks

        rows.forEach((row, yOffset) => {
            let xOffset = 0;  // Reset xOffset for each row

            // Iterate over the row to calculate positions
            for (let i = 0; i < row.length; i++) {
                const col = row[i];

                if (col && col !== '-' && col !== ' ') {
                    // Calculate the position of the extension based on the flag position and offsets
                    const x = flagPos.x - xOffset; // The x-coordinate decreases (moving left)
                    const y = flagPos.y + yOffset; // The y-coordinate increases (moving down)
                    const pos = new RoomPosition(x, y, flagPos.roomName);

                    // Check if the position is valid (not blocked by walls)
                    if (pos.lookFor(LOOK_TERRAIN)[0] !== 'wall') {
                        positions.push({
                            position: pos,
                            type: col,
                            farmNumber
                        });
                    }
                }
                xOffset++;  // Each space increments the x offset
            }
        });

        return positions;
    }


}
