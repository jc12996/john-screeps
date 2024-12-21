export function placeSourceLinks(creep: Creep) {
  const totalNumberOfLinkSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
    filter: (struc: { structureType: string }) => {
      return struc.structureType === STRUCTURE_LINK;
    }
  });

  const sourceLink1FlagTemp = creep.room.find(FIND_FLAGS, {
    filter: site => {
      return site.name == creep.room.name + "SourceLink1";
    }
  });

  if (
    creep?.room?.controller?.level &&
    creep?.room?.controller?.level == 5 &&
    totalNumberOfLinkSites.length == 1 &&
    !sourceLink1FlagTemp[0]
  ) {
    if (creep.room?.createConstructionSite(creep.pos.x - 1, creep.pos.y, STRUCTURE_LINK) == OK) {
      creep.room.createFlag(creep.pos.x - 1, creep.pos.y, creep.room.name + "SourceLink1");
    } else if (creep.room?.createConstructionSite(creep.pos.x + 1, creep.pos.y, STRUCTURE_LINK) == OK) {
      creep.room.createFlag(creep.pos.x + 1, creep.pos.y, creep.room.name + "SourceLink1");
    } else if (creep.room?.createConstructionSite(creep.pos.x, creep.pos.y + 1, STRUCTURE_LINK) == OK) {
      creep.room.createFlag(creep.pos.x, creep.pos.y + 1, creep.room.name + "SourceLink1");
    } else if (creep.room?.createConstructionSite(creep.pos.x, creep.pos.y - 1, STRUCTURE_LINK) == OK) {
      creep.room.createFlag(creep.pos.x, creep.pos.y - 1, creep.room.name + "SourceLink1");
    }
  }

  if (creep?.room?.controller?.level && creep?.room?.controller?.level == 7) {
    const sourceLink2FlagTemp = creep.room.find(FIND_FLAGS, {
      filter: site => {
        return site.name == creep.room.name + "SourceLink2";
      }
    });
    if (!sourceLink2FlagTemp.length) {
      if (creep.room?.createConstructionSite(creep.pos.x - 1, creep.pos.y, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x - 1, creep.pos.y, creep.room.name + "SourceLink2");
      } else if (creep.room?.createConstructionSite(creep.pos.x + 1, creep.pos.y, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x + 1, creep.pos.y, creep.room.name + "SourceLink2");
      } else if (creep.room?.createConstructionSite(creep.pos.x, creep.pos.y + 1, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x, creep.pos.y + 1, creep.room.name + "SourceLink2");
      } else if (creep.room?.createConstructionSite(creep.pos.x, creep.pos.y - 1, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x, creep.pos.y - 1, creep.room.name + "SourceLink2");
      }
    }
  }

  if (creep?.room?.controller?.level && creep?.room?.controller?.level == 8) {
    const sourceLink3FlagTemp = creep.room.find(FIND_FLAGS, {
      filter: site => {
        return site.name == creep.room.name + "SourceLink3";
      }
    });
    if (!sourceLink3FlagTemp.length) {
      if (creep.room?.createConstructionSite(creep.pos.x - 1, creep.pos.y, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x - 1, creep.pos.y, creep.room.name + "SourceLink3");
      } else if (creep.room?.createConstructionSite(creep.pos.x + 1, creep.pos.y, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x + 1, creep.pos.y, creep.room.name + "SourceLink3");
      } else if (creep.room?.createConstructionSite(creep.pos.x, creep.pos.y + 1, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x, creep.pos.y + 1, creep.room.name + "SourceLink3");
      } else if (creep.room?.createConstructionSite(creep.pos.x, creep.pos.y - 1, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x, creep.pos.y - 1, creep.room.name + "SourceLink3");
      }
    }
  }

  if (creep?.room?.controller?.level && creep?.room?.controller?.level == 8) {
    const sourceLink2FlagTemp = creep.room.find(FIND_FLAGS, {
      filter: site => {
        return site.name == creep.room.name + "SourceLink4";
      }
    });
    if (!sourceLink2FlagTemp.length) {
      if (creep.room?.createConstructionSite(creep.pos.x - 1, creep.pos.y, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x - 1, creep.pos.y, creep.room.name + "SourceLink4");
      } else if (creep.room?.createConstructionSite(creep.pos.x + 1, creep.pos.y, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x + 1, creep.pos.y, creep.room.name + "SourceLink4");
      } else if (creep.room?.createConstructionSite(creep.pos.x, creep.pos.y + 1, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x, creep.pos.y + 1, creep.room.name + "SourceLink4");
      } else if (creep.room?.createConstructionSite(creep.pos.x, creep.pos.y - 1, STRUCTURE_LINK) == OK) {
        creep.room.createFlag(creep.pos.x, creep.pos.y - 1, creep.room.name + "SourceLink4");
      }
    }
  }
}

export function transferEnergyToOriginSpawn(room: Room) {
  // Find the room that has the spawn named 'Spawn1' and ensure you own it
  const spawn1 = Game.spawns["Spawn1"];
  if (!room.controller || !room.controller.my) {
    //console.log('Spawn1 not found or you do not control the room');
    return;
  }

  const targetRoom = room;
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

    const mineral = terminal.room.find(FIND_MINERALS)[0];

    // Check if the terminal has more than 10,000 energy
    if (
      targetRoom.terminal &&
      targetRoom.terminal.store[RESOURCE_ENERGY] < 10000 &&
      terminal.store[RESOURCE_ENERGY] > 10000 &&
      terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 2000 &&
      targetTerminal.store[RESOURCE_ENERGY] < 2000
    ) {
      // Calculate the amount of energy to transfer (optional, transfer everything above 2k)
      const transferAmount = 2000;

      // Transfer energy to Spawn1's terminal
      const result = terminal.send(RESOURCE_ENERGY, transferAmount, targetRoom.name);

      if (result === OK) {
        console.log(`Transferred ${transferAmount} energy from ${roomName} to ${targetRoom.name}`);
      } else {
        console.log(`Failed to transfer energy from ${roomName} to ${targetRoom.name}: ${result}`);
      }
    }

    if (
      mineral &&
      terminal.store[mineral.mineralType] >= 2000 &&
      targetRoom.terminal &&
      targetRoom.terminal?.store[mineral.mineralType] < 4000
    ) {
      // Calculate the amount of energy to transfer (optional, transfer everything below 2k)
      const transferAmount = 2000;
      // Transfer energy to Spawn1's terminal
      const result = terminal.send(mineral.mineralType, transferAmount, targetRoom.name);

      if (result === OK) {
        console.log(`Transferred ${transferAmount} ${mineral.mineralType} from ${roomName} to ${targetRoom.name}`);
      } else {
        console.log(`Failed to transfer ${mineral.mineralType} from ${roomName} to ${targetRoom.name}: ${result}`);
      }
    }
  }
}

export function sendEnergyFromOriginSpawn() {
  // Find the room with Spawn1
  const spawn1Room = Game.spawns["Spawn1"].room;
  const terminal = spawn1Room.terminal;

  const mainTermainalStuff = [
    RESOURCE_GHODIUM,
    RESOURCE_HYDROGEN,
    RESOURCE_LEMERGIUM,
    RESOURCE_KEANIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_UTRIUM,
    RESOURCE_UTRIUM_LEMERGITE,
    RESOURCE_ZYNTHIUM_KEANITE,
    RESOURCE_ENERGY
  ];

  // Check if terminal in the spawn1 room has more than 40K energy
  if (!terminal || terminal.store[RESOURCE_ENERGY] < 40000) {
    //console.log('Not enough energy in Spawn1 terminal.');
    return;
  }

  // Loop through all rooms to find terminals in rooms with RCL 7 or above
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    const controller = room.controller;
    const targetTerminal = room.terminal;

    // Only consider rooms with RCL >= 6 and an active terminal
    if (controller && controller.level >= 6 && targetTerminal && targetTerminal !== terminal) {
      // Check if the terminal has less than 2K of that resource
      if (targetTerminal.store[RESOURCE_ENERGY] < 2000 && terminal.store[RESOURCE_ENERGY] >= 40000) {
        const amountToSend = 20000;

        // Make sure Spawn1 has enough energy left to send 20K
        if (terminal.store[RESOURCE_ENERGY] >= amountToSend) {
          const result = terminal.send(RESOURCE_ENERGY, amountToSend, targetTerminal.room.name);

          if (result === OK) {
            console.log(`Sent ${amountToSend} energy from Spawn1 to ${targetTerminal.room.name}`);
          } else if (result !== ERR_TIRED) {
            console.log(`Failed to send energy to ${targetTerminal.room.name}: ${result}`);
          }
        }
      }

      mainTermainalStuff.forEach(resourceConstant => {
        // Check if the terminal has less than 1K of that resource
        if (targetTerminal.store[resourceConstant] < 3000 && terminal.store[resourceConstant] >= 6000) {
          const amountToSend = 3000;

          // Make sure Spawn1 has enough energy left to send 10K
          if (terminal.store[resourceConstant] >= amountToSend) {
            const result = terminal.send(resourceConstant, amountToSend, roomName);

            if (result === OK) {
              console.log(`Sent ${amountToSend} energy from Spawn1 to ${roomName}`);
            } else if (result !== ERR_TIRED) {
              console.log(`Failed to send energy to ${roomName}: ${result}`);
            }
          }
        }
      });
    }
  }
}

export function operateLinks(creep: Creep | StructureSpawn) {
  const sourceFlags = creep.room.find(FIND_FLAGS, {
    filter: site => {
      return site.name.includes(creep.room.name + "SourceLink");
    }
  });

  const activeSources = creep.room.find(FIND_SOURCES_ACTIVE);

  const xCreepCapacityCreeps = creep.room.find(FIND_MY_CREEPS, {
    filter: creep => creep.memory.extensionFarm == 1 || creep.memory.extensionFarm === 2 || creep.memory.mainUpgrader
  });

  let xCapacity = 700;

  if (xCreepCapacityCreeps.length) {
    const xCreepCapacity = xCreepCapacityCreeps[0].store.getCapacity();
    if (xCreepCapacity > 0) {
      xCapacity = xCreepCapacity;
    }
  }
  if (xCapacity > 400) {
    xCapacity = 700;
  }

  const extensionLink = getLinkByTag(creep, "ExtensionLink");
  const extensionLink2 = getLinkByTag(creep, "ExtensionLink2");
  const controllerLink = getLinkByTag(creep, "ControllerLink1");

  for (const sourceFlag of sourceFlags) {
    const filledSourceLinks: Array<StructureLink> = creep.room.find(FIND_STRUCTURES, {
      filter: struc => {
        return (
          sourceFlag &&
          sourceFlag.pos &&
          struc.pos.x == sourceFlag.pos.x &&
          struc.pos.y == sourceFlag.pos.y &&
          struc.structureType === STRUCTURE_LINK &&
          (struc.store[RESOURCE_ENERGY] >= xCapacity ||
            (activeSources.length == 0 && struc.store[RESOURCE_ENERGY] >= 100))
        );
      }
    });

    for (const filledSourceLink of filledSourceLinks) {
      if (!filledSourceLink || filledSourceLink.structureType !== STRUCTURE_LINK) {
        return;
      }

      // Prioritize extension links based on the number of unfilled extensions and spawns around them
      if (creep.room.controller?.my) {
        let targetLink = controllerLink;

        if (extensionLink2 && extensionLink) {
          const unfilledAroundLink1 = creep.room
            .lookForAtArea(
              LOOK_STRUCTURES,
              extensionLink.pos.y - 3,
              extensionLink.pos.x - 5,
              extensionLink.pos.y + 3,
              extensionLink.pos.x + 3,
              true
            )
            .filter(
              s =>
                (s.structure.structureType === STRUCTURE_EXTENSION || s.structure.structureType === STRUCTURE_SPAWN) &&
                (s.structure as AnyStoreStructure).store.getFreeCapacity(RESOURCE_ENERGY) > 0
            ).length;

          const unfilledAroundLink2 = creep.room
            .lookForAtArea(
              LOOK_STRUCTURES,
              extensionLink2.pos.y - 3,
              extensionLink2.pos.x - 5,
              extensionLink2.pos.y + 3,
              extensionLink2.pos.x + 3,
              true
            )
            .filter(
              s =>
                (s.structure.structureType === STRUCTURE_EXTENSION || s.structure.structureType === STRUCTURE_SPAWN) &&
                (s.structure as AnyStoreStructure).store.getFreeCapacity(RESOURCE_ENERGY) > 0
            ).length;

          if (unfilledAroundLink2 > unfilledAroundLink1) {
            targetLink = extensionLink2;
          } else {
            targetLink = extensionLink;
          }
        } else if (extensionLink) {
          targetLink = extensionLink;
        } else if (extensionLink2) {
          targetLink = extensionLink2;
        } else if (controllerLink) {
          targetLink = controllerLink;
        }

        filledSourceLink.transferEnergy(targetLink);
      }
    }
  }
}

export function getLinkByTag(creep: Creep | StructureSpawn, linkTag: string): StructureLink {
  const linkFlag =
    creep.room.find(FIND_FLAGS, {
      filter: link => {
        return link.name == creep.room.name + linkTag;
      }
    })[0] ?? null;

  const links: Array<StructureLink> = creep.room.find(FIND_MY_STRUCTURES, {
    filter: struc => {
      return (
        linkFlag &&
        struc &&
        struc.structureType === STRUCTURE_LINK &&
        struc.pos.x == linkFlag.pos.x &&
        struc.pos.y == linkFlag.pos.y
      );
    }
  });
  return links[0];
}
