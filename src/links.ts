export function harvesterContainerSourceAndExtensionLinks(creep: Creep) {

    var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter:  (structure) => {
            return (
                structure.structureType == STRUCTURE_CONTAINER

            ) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });

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

    const sourceLink1Flag = creep.room.find(FIND_FLAGS, {
        filter: (site) => {
            return site.name == creep.room.name+'SourceLink1'
        }
    })

    const activeSources = creep.room.find(FIND_SOURCES_ACTIVE);

    const xCreepCapacityCreeps = creep.room.find(FIND_MY_CREEPS, {
        filter: (creep) => creep.memory.extensionFarm1
    })

    let xCapacity = 800;

    if(xCreepCapacityCreeps.length) {
        const xCreepCapacity = xCreepCapacityCreeps[0].store.getCapacity();
        if(xCreepCapacity > 0) {
            xCapacity = xCreepCapacity
        }
    }
    if(xCapacity > 800) {
        xCapacity = 800;
    }

    const filledSourceLink1 = creep.pos.findClosestByPath(FIND_STRUCTURES,{
        filter: (struc) => {
            return (
                sourceLink1Flag[0] &&
                sourceLink1Flag[0].pos &&
                struc.pos.x == sourceLink1Flag[0].pos.x &&
                struc.pos.y == sourceLink1Flag[0].pos.y &&
                struc.structureType === STRUCTURE_LINK &&
                (struc.store[RESOURCE_ENERGY] >= xCapacity || (activeSources.length == 0 && struc.store[RESOURCE_ENERGY] >= 100))

    )}
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
                creep.room?.createConstructionSite(filledSourceLink1.pos.x,filledSourceLink1.pos.y,STRUCTURE_RAMPART)
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
