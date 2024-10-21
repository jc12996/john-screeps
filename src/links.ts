import { link } from "fs";
import { SpawnUtils } from "utils/SpawnUtils";
import { getHeapSpaceStatistics } from "v8";

export function placeSourceLinks(creep: Creep) {

    const totalNumberOfLinkSites = creep.room.find(FIND_CONSTRUCTION_SITES,{
        filter: (struc: { structureType: string; }) => {
            return struc.structureType === STRUCTURE_LINK
        }
    });

    const sourceLink1FlagTemp = creep.room.find(FIND_FLAGS, {
        filter: (site) => {
            return site.name == creep.room.name+'SourceLink1'
        }
    })


    if (creep?.room?.controller?.level && creep?.room?.controller?.level == 5  && totalNumberOfLinkSites.length == 1 && !sourceLink1FlagTemp[0]) {
        if(creep.room?.createConstructionSite(creep.pos.x -1,creep.pos.y,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x -1,creep.pos.y,creep.room.name+'SourceLink1');
        } else if(creep.room?.createConstructionSite(creep.pos.x +1,creep.pos.y,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x +1,creep.pos.y,creep.room.name+'SourceLink1');
        } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y +1,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x,creep.pos.y +1,creep.room.name+'SourceLink1');
        } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y -1,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x,creep.pos.y -1,creep.room.name+'SourceLink1');
        }

    }

    if(creep?.room?.controller?.level && creep?.room?.controller?.level == 7) {
        const sourceLink2FlagTemp = creep.room.find(FIND_FLAGS, {
            filter: (site) => {
                return site.name == creep.room.name+'SourceLink2'
            }
        })
        if (!sourceLink2FlagTemp.length) {
            if(creep.room?.createConstructionSite(creep.pos.x -1,creep.pos.y,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x -1,creep.pos.y,creep.room.name+'SourceLink2');
            } else if(creep.room?.createConstructionSite(creep.pos.x +1,creep.pos.y,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x +1,creep.pos.y,creep.room.name+'SourceLink2');
            } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y +1,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x,creep.pos.y +1,creep.room.name+'SourceLink2');
            } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y -1,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x,creep.pos.y -1,creep.room.name+'SourceLink2');
            }

        }
    }


    if(creep?.room?.controller?.level && creep?.room?.controller?.level == 8) {
        const sourceLink3FlagTemp = creep.room.find(FIND_FLAGS, {
            filter: (site) => {
                return site.name == creep.room.name+'SourceLink3'
            }
        })
        if (!sourceLink3FlagTemp.length) {

            if(creep.room?.createConstructionSite(creep.pos.x -1,creep.pos.y,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x -1,creep.pos.y,creep.room.name+'SourceLink3');
            } else if(creep.room?.createConstructionSite(creep.pos.x +1,creep.pos.y,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x +1,creep.pos.y,creep.room.name+'SourceLink3');
            } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y +1,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x,creep.pos.y +1,creep.room.name+'SourceLink3');
            } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y -1,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x,creep.pos.y -1,creep.room.name+'SourceLink3');
            }

        }
    }

    if(creep?.room?.controller?.level && creep?.room?.controller?.level == 8) {
        const sourceLink2FlagTemp = creep.room.find(FIND_FLAGS, {
            filter: (site) => {
                return site.name == creep.room.name+'SourceLink4'
            }
        })
        if (!sourceLink2FlagTemp.length) {
            if(creep.room?.createConstructionSite(creep.pos.x -1,creep.pos.y,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x -1,creep.pos.y,creep.room.name+'SourceLink4');
            } else if(creep.room?.createConstructionSite(creep.pos.x +1,creep.pos.y,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x +1,creep.pos.y,creep.room.name+'SourceLink4');
            } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y +1,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x,creep.pos.y +1,creep.room.name+'SourceLink4');
            } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y -1,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x,creep.pos.y -1,creep.room.name+'SourceLink4');
            }

        }
    }
}


export function transferEnergyToSpawn1Room() {
    // Find the room that has the spawn named 'Spawn1' and ensure you own it
    const spawn1 = Game.spawns['Spawn1'];
    if (!spawn1 || !spawn1.room.controller || !spawn1.room.controller.my) {
        //console.log('Spawn1 not found or you do not control the room');
        return;
    }

    const targetRoom = spawn1.room;
    const targetTerminal = targetRoom.terminal;

    if (!targetTerminal) {
        //console.log('Target room does not have a terminal');
        return;
    }

    // Iterate through all rooms that you control and that have a terminal
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        const terminal = room.terminal;

        // Skip if the room does not have a terminal or if you do not control the room
        if (!terminal || !room.controller || !room.controller.my) {
            continue;
        }

        // Skip if this is the room with Spawn1's terminal
        if (room.name === targetRoom.name) {
            continue;
        }

        // Check if the terminal has more than 10,000 energy
        if (terminal.store[RESOURCE_ENERGY] > 10000 && terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 2000) {
            // Calculate the amount of energy to transfer (optional, transfer everything above 2k)
            const transferAmount = terminal.store.getUsedCapacity(RESOURCE_ENERGY) - 2000;

            // Transfer energy to Spawn1's terminal
            const result = terminal.send(RESOURCE_ENERGY, transferAmount, targetRoom.name);

            if (result === OK) {
                console.log(`Transferred ${transferAmount} energy from ${roomName} to ${targetRoom.name}`);
            } else {
                console.log(`Failed to transfer energy from ${roomName} to ${targetRoom.name}: ${result}`);
            }
        }
    }
}

export function sendEnergyFromSpawn1() {
    // Find the room with Spawn1
    const spawn1Room = Game.spawns['Spawn1'].room;
    const terminal = spawn1Room.terminal;

    // Check if terminal in the spawn1 room has more than 10K energy
    if (!terminal || terminal.store[RESOURCE_ENERGY] < 10000) {
        //console.log('Not enough energy in Spawn1 terminal.');
        return;
    }

    // Loop through all rooms to find terminals in rooms with RCL 7 or above
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        const controller = room.controller;
        const targetTerminal = room.terminal;

        // Only consider rooms with RCL >= 7 and an active terminal
        if (controller && controller.level >= 7 && targetTerminal) {
            // Check if the terminal has no energy
            if (targetTerminal.store[RESOURCE_ENERGY] === 0) {
                const amountToSend = 2000;

                // Make sure Spawn1 has enough energy left to send 10K
                if (terminal.store[RESOURCE_ENERGY] >= amountToSend) {
                    const result = terminal.send(RESOURCE_ENERGY, amountToSend, roomName);

                    if (result === OK) {
                        console.log(`Sent ${amountToSend} energy from Spawn1 to ${roomName}`);
                    } else {
                        console.log(`Failed to send energy to ${roomName}: ${result}`);
                    }
                } else {
                    //console.log('Not enough energy left in Spawn1 terminal to send 10K.');
                    break;
                }
            }
        }
    }
}

export function operateLinks(creep: Creep | StructureSpawn) {

    const sourceFlags = creep.room.find(FIND_FLAGS, {
        filter: (site) => {
            return site.name.includes(creep.room.name+'SourceLink')
        }
    })

    const activeSources = creep.room.find(FIND_SOURCES_ACTIVE);

    const xCreepCapacityCreeps = creep.room.find(FIND_MY_CREEPS, {
        filter: (creep) => (creep.memory.extensionFarm == 1 || creep.memory.extensionFarm === 2 || creep.memory.mainUpgrader)
    })

    let xCapacity = 700;

    if(xCreepCapacityCreeps.length) {
        const xCreepCapacity = xCreepCapacityCreeps[0].store.getCapacity();
        if(xCreepCapacity > 0) {
            xCapacity = xCreepCapacity
        }
    }
    if(xCapacity > 400) {
        xCapacity = 700;
    }

    for(const sourceFlag of sourceFlags) {
        const filledSourceLink1: StructureLink | null = creep.pos.findClosestByPath(FIND_STRUCTURES,{
            filter: (struc) => {
                return (
                    (sourceFlag &&
                    sourceFlag.pos &&
                    struc.pos.x == sourceFlag.pos.x &&
                    struc.pos.y == sourceFlag.pos.y )

                    &&
                    struc.structureType === STRUCTURE_LINK &&
                    (struc.store[RESOURCE_ENERGY] >= xCapacity || (activeSources.length == 0 && struc.store[RESOURCE_ENERGY] >= 100))

            )}
        });




        const extensionLink = getLinkByTag(creep, 'ExtensionLink');
        const extensionLink2 = getLinkByTag(creep,'ExtensionLink2');
        const controllerLink = getLinkByTag(creep,'ControllerLink1');



        if(!filledSourceLink1 || filledSourceLink1.structureType !== STRUCTURE_LINK) {
            return;
        }

        // SOURCE -> EXTENSION 2 -> EXTENSION 1 -> CONTROLLER LINK
        if(creep.room.controller?.my) {

            if(extensionLink2 && extensionLink) {
                if(extensionLink2.store.energy < extensionLink.store.energy) {
                    filledSourceLink1.transferEnergy(extensionLink2)
                } else {
                    filledSourceLink1.transferEnergy(extensionLink);
                }
            } else if(extensionLink) {
                filledSourceLink1.transferEnergy(extensionLink);
            } else {
                filledSourceLink1.transferEnergy(controllerLink);
            }


        }
    }



}



export function getLinkByTag(creep: Creep | StructureSpawn, linkTag: string): StructureLink {
    const linkFlag= creep.room.find(FIND_FLAGS, {
        filter: (link) => {

            return link.name == creep.room.name+linkTag
        }
    })[0] ?? null;

    const links: Array<StructureLink> = creep.room.find(FIND_MY_STRUCTURES,{
        filter: (struc) => {

            return linkFlag && struc && struc.structureType === STRUCTURE_LINK && struc.pos.x == linkFlag.pos.x && struc.pos.y == linkFlag.pos.y
        }
    });
    return links[0];

}
