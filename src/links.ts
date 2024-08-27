export function harvesterContainerSourceAndExtensionLinks(creep: Creep) {

    const sourceLink1Flag = creep.room.find(FIND_FLAGS, {
        filter: (site) => {
            return site.name == creep.room.name+'SourceLink1Flag'
        }
    })

    var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter:  (structure) => {
            return (
                structure.structureType == STRUCTURE_CONTAINER

            ) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });

    if (creep?.room?.controller?.level && creep?.room?.controller?.level == 5 && !sourceLink1Flag[0]) {
        if(creep.room?.createConstructionSite(creep.pos.x -1,creep.pos.y,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x -1,creep.pos.y,creep.room.name+'SourceLink1');
            creep.room?.createConstructionSite(creep.pos.x -1,creep.pos.y,STRUCTURE_RAMPART)
        } else if(creep.room?.createConstructionSite(creep.pos.x +1,creep.pos.y,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x +1,creep.pos.y,creep.room.name+'SourceLink1');
            creep.room?.createConstructionSite(creep.pos.x +1,creep.pos.y,STRUCTURE_RAMPART)
        } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y +1,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x,creep.pos.y +1,creep.room.name+'SourceLink1');
            creep.room?.createConstructionSite(creep.pos.x,creep.pos.y+1,STRUCTURE_RAMPART)
        } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y -1,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x,creep.pos.y -1,creep.room.name+'SourceLink1');
            creep.room?.createConstructionSite(creep.pos.x -1,creep.pos.y,STRUCTURE_RAMPART)
        }

    }

    const activeSources = creep.room.find(FIND_SOURCES_ACTIVE)

    const filledSourceLink1 = creep.pos.findClosestByPath(FIND_STRUCTURES,{
        filter: (struc) => {
            return struc.structureType === STRUCTURE_LINK && (struc.store[RESOURCE_ENERGY] >= 800 || (activeSources.length == 0 && struc.store[RESOURCE_ENERGY] >= 100))
        }
    })

    if(filledSourceLink1) {
        const extensionLinkFlag= creep.room.find(FIND_FLAGS, {
            filter: (link) => {
                return link.name == creep.room.name+'ExtensionLink'
            }
        });

        if(extensionLinkFlag[0]) {
            const extensionLink = creep.pos.findClosestByPath(FIND_STRUCTURES,{
                filter: (struc) => {
                    return struc.structureType === STRUCTURE_LINK && struc.pos.x == extensionLinkFlag[0].pos.x && struc.pos.y == extensionLinkFlag[0].pos.y
                }
            });
            if(extensionLink && extensionLink.structureType === STRUCTURE_LINK && filledSourceLink1.structureType === STRUCTURE_LINK) {
                filledSourceLink1.transferEnergy(extensionLink,filledSourceLink1.store[RESOURCE_ENERGY]);
            }
        }


    }

    const sourceLink1 = creep.pos.findClosestByPath(FIND_STRUCTURES,{
        filter: (struc) => {
            return struc.structureType === STRUCTURE_LINK
        }
    })


    if(sourceLink1 && creep?.pos.inRangeTo(sourceLink1.pos.x,sourceLink1.pos.y, 1 )) {
        creep.transfer(sourceLink1, RESOURCE_ENERGY)
    }else if(container) {
        creep.transfer(container, RESOURCE_ENERGY);
    }


}
