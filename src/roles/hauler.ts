import { Labs } from "labs";
import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";
import { Miner } from "./miner";
import { Carrier } from "./carrier";

export class Hauler {
  public static run(creep: Creep): void {
    // Early returns for invalid state
    if (!creep.memory?.firstSpawnCoords) return;

    // Handle boosting
    if (!creep.memory.isBoosted && !Labs.boostCreep(creep)) return;

        // Update carrying state
        if (!creep.memory.carrying && creep.store.getFreeCapacity() === 0 || creep.store[RESOURCE_ENERGY] > 100) {
            creep.memory.carrying = true;
        } else if (creep.memory.carrying && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.carrying = false;
        }

    const firstRoom = Game.rooms[creep.memory.firstSpawnCoords];

    if (creep.memory.carrying) {
      this.dropOffStuff(creep, firstRoom);
      return;
    }

    // Handle resource collection
    if (!creep.memory.assignedMineFlag) {
      creep.memory.assignedMineFlag = creep.memory.firstSpawnCoords + "MineFlag";
      return;
    }

    const mineFlag = Game.flags[creep.memory.assignedMineFlag];
    if (!mineFlag) return;

    if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
      creep.say("🚚" + mineFlag.room?.name);
    }

    // Check existing container target
    if (creep.memory.targetContainerId) {
      const container = Game.getObjectById(creep.memory.targetContainerId as Id<StructureContainer>);
      if (container && container.store[RESOURCE_ENERGY] >= 200) {
        if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(container.pos, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }
      delete creep.memory.targetContainerId;
    }

    // Find new container target
    const containers = creep.room.find(FIND_STRUCTURES, {
      filter: s =>
        s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= Math.min(creep.store.getCapacity(), 200)
    }) as StructureContainer[];

    // Get best available container
    const container = containers
      .sort((a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY])
      .find(
        c =>
          !_.find(
            Game.creeps,
            creep => creep.memory.role === "hauler" && creep.memory.hauling && creep.pos.isEqualTo(c.pos)
          )
      );

    if (container && creep.room === mineFlag.room) {
      creep.memory.targetContainerId = container.id;

      if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    } else if (creep.room !== mineFlag.room) {
      MovementUtils.goToFlag(creep, mineFlag);
      return;
    }

    // Check for dropped resources
    const droppedSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: source => source.amount >= 50
    });

    if (droppedSource && creep.pickup(droppedSource) === ERR_NOT_IN_RANGE) {
      creep.moveTo(droppedSource, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }

  private static dropOffStuff(creep: Creep, firstRoom: Room) {
    const spawn = firstRoom.find(FIND_MY_SPAWNS)[0];

    if (creep.room !== firstRoom) {
      const sourceKeepers = creep.room.find(FIND_HOSTILE_CREEPS, {
        filter: c => c.owner.username === "Source Keeper"
      });
      const moveOpts =
        sourceKeepers.length > 0
          ? {
              costCallback: (roomName: string, costMatrix: CostMatrix) => {
                sourceKeepers.forEach(keeper => {
                  const range = 5;
                  for (let x = -range; x <= range; x++) {
                    for (let y = -range; y <= range; y++) {
                      const xPos = keeper.pos.x + x;
                      const yPos = keeper.pos.y + y;
                      if (xPos >= 0 && xPos < 50 && yPos >= 0 && yPos < 50) {
                        costMatrix.set(xPos, yPos, 255);
                      }
                    }
                  }
                });
              }
            }
          : undefined;

      creep.moveTo(spawn, moveOpts);
      return;
    }

    creep.say("🚚 C");
    Carrier.run(creep);
  }
}
