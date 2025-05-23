export enum LabMapper {
  K = 0,
  ZK = 1,
  U = 2,
  UL = 3,
  Z = 4,
  GH = 5,
  UH = 6,
  L = 7,
  LH = 8,
  H = 9,
  LO = -1, // NON existant todo,
  O = -1, // NON existant todo,
  GO = -1 // Non existant todo
}

export const compoundOutputMap: Record<string, ResourceConstant | null> = {
  ZK: RESOURCE_ZYNTHIUM_KEANITE,
  UL: RESOURCE_UTRIUM_LEMERGITE,
  GH: RESOURCE_GHODIUM,
  UH: RESOURCE_UTRIUM_HYDRIDE,
  LH: RESOURCE_LEMERGIUM_HYDRIDE,
  LO: RESOURCE_LEMERGIUM_OXIDE,
  GO: RESOURCE_GHODIUM_OXIDE,
  KH: RESOURCE_KEANIUM_HYDRIDE,
  UO: RESOURCE_UTRIUM_OXIDE
};

export class Labs {
  public static MAP = {
    input1: "",
    input2: "",
    output: ""
  };

  public static inputLabs: StructureLab[];
  public static outputLabs: StructureLab[];

  public static setLabMapper(room: Room) {
    const labSetFlags =
      room.find(FIND_FLAGS, {
        filter: flag => {
          return flag.name.includes(room.name + "SetLabs:");
        }
      })[0] ?? null;

    if (!labSetFlags) {
      return;
    }

    const labFarmFlag = Game.flags[room.name + "LabFarm"];
    if (!labFarmFlag) {
      return;
    }

    const nameOfLabFlag = labSetFlags.name;
    const compoundString = nameOfLabFlag.split(":")[1];
    const inputs = compoundString.split("-");
    this.MAP.input1 = inputs[0] ?? "";
    this.MAP.input2 = inputs[1] ?? "";
    this.MAP.output =
      compoundOutputMap[this.MAP.input1 + this.MAP.input2] ??
      ("" as MineralCompoundConstant | MineralBaseCompoundsConstant | MineralBoostConstant);


    this.inputLabs = room.find(FIND_STRUCTURES, {
      filter: lab => {
        return (
          lab.structureType === STRUCTURE_LAB &&
          ((lab.pos.x === labFarmFlag.pos.x && lab.pos.y === labFarmFlag.pos.y) ||
            (lab.pos.x === labFarmFlag.pos.x - 1 && lab.pos.y === labFarmFlag.pos.y + 1))
        );
      }
    }) as StructureLab[];
      // console.log(this.inputLabs)
    if (this.inputLabs.length !== 2) {
      return;
    }

    this.outputLabs = room.find(FIND_STRUCTURES, {
      filter: lab => {
        return (
          lab.structureType === STRUCTURE_LAB &&
          !(
            (lab.pos.x === labFarmFlag.pos.x && lab.pos.y === labFarmFlag.pos.y) ||
            (lab.pos.x === labFarmFlag.pos.x + 1 && lab.pos.y === labFarmFlag.pos.y + 1)
          )
        );
      }
    }) as StructureLab[];
    //console.log(this.outputLabs.length)
    Labs.runLabs2();
  }

  public static runLabs2() {
    if (!this.outputLabs || this.outputLabs.length === 0 || !this.inputLabs || this.inputLabs.length < 2) {
      return;
    }

    const inputLab1 = Game.getObjectById(this.inputLabs[0].id) as StructureLab;
    const inputLab2 = Game.getObjectById(this.inputLabs[1].id) as StructureLab;
    const outputLab = Game.getObjectById(this.outputLabs[this.outputLabs.length - 1].id) as StructureLab;
    // console.log(inputLab1, inputLab2, outputLab);
    if (!inputLab1 || !inputLab2 || !outputLab) {
      return;
    }

    const input1MineralConstant = this.MAP.input1 as MineralConstant | MineralCompoundConstant | null;
    const input2MineralConstant = this.MAP.input2 as MineralConstant | MineralCompoundConstant | null;
    const outputCompoundConstant = this.MAP.output as MineralConstant | MineralCompoundConstant | null;
    // console.log(input1MineralConstant, input2MineralConstant, outputCompoundConstant);
    if (!input1MineralConstant || !input2MineralConstant || !outputCompoundConstant) {
      return;
    }

    const inputLab1Ready = inputLab1.store && inputLab1.store[input1MineralConstant] > 300;
    const inputLab2Ready = inputLab2.store && inputLab2.store[input2MineralConstant] > 300;

    for (const outputLab of this.outputLabs) {
      // console.log(outputLab);
      const outputLabReady = outputLab.store && outputLab.store[outputCompoundConstant] < 2700;
      if (outputLab && !!inputLab1 && !!inputLab2 && !!outputLabReady && inputLab1Ready && inputLab2Ready) {
        outputLab.runReaction(inputLab1, inputLab2);
      }
    }
  }

  public static runLabs(room: Room) {
    const labs: StructureLab[] = room.find(FIND_STRUCTURES, {
      filter: structure => {
        return structure.structureType === STRUCTURE_LAB;
      }
    }) as StructureLab[];

    const ZK_lab = labs[LabMapper.ZK] ?? null;
    const LU_lab = labs[LabMapper.UL] ?? null;
    const GH_lab = labs[LabMapper.GH] ?? null;

    const L_lab = labs[LabMapper.L] ?? null;
    const U_lab = labs[LabMapper.U] ?? null;
    const Z_lab = labs[LabMapper.Z] ?? null;
    const K_lab = labs[LabMapper.K] ?? null;
    const H_lab = labs[LabMapper.H] ?? null;
    const O_lab = labs[LabMapper.O] ?? null;

    // Boost Labs
    const UH_lab = labs[LabMapper.UH] ?? null;
    const LH_lab = labs[LabMapper.LH] ?? null;
    const LO_lab = labs[LabMapper.LO] ?? null;
    const GO_lab = labs[LabMapper.GO] ?? null;

    if (
      GH_lab &&
      LU_lab &&
      ZK_lab &&
      LU_lab.store[RESOURCE_GHODIUM] < 3000 &&
      ZK_lab.store[RESOURCE_ZYNTHIUM_KEANITE] > 300 &&
      LU_lab.store[RESOURCE_UTRIUM_LEMERGITE] > 300
    ) {
      GH_lab.runReaction(ZK_lab, LU_lab);
    }

    if (
      ZK_lab &&
      K_lab &&
      Z_lab &&
      ZK_lab.store[RESOURCE_ZYNTHIUM_KEANITE] < 3000 &&
      Z_lab.store[RESOURCE_ZYNTHIUM] > 0 &&
      K_lab.store[RESOURCE_KEANIUM] > 0
    ) {
      ZK_lab.runReaction(Z_lab, K_lab);
    }

    if (
      LU_lab &&
      L_lab &&
      U_lab &&
      LU_lab.store[RESOURCE_UTRIUM_LEMERGITE] < 3000 &&
      L_lab.store[RESOURCE_LEMERGIUM] > 0 &&
      U_lab.store[RESOURCE_UTRIUM] > 0
    ) {
      LU_lab.runReaction(L_lab, U_lab);
    }

    if (
      UH_lab &&
      U_lab &&
      H_lab &&
      UH_lab.store[RESOURCE_UTRIUM_HYDRIDE] < 3000 &&
      U_lab.store[RESOURCE_UTRIUM] > 0 &&
      H_lab.store[RESOURCE_HYDROGEN] > 0
    ) {
      UH_lab.runReaction(U_lab, H_lab);
    }

    if (
      LH_lab &&
      L_lab &&
      H_lab &&
      UH_lab.store[RESOURCE_LEMERGIUM_HYDRIDE] < 3000 &&
      L_lab.store[RESOURCE_LEMERGIUM] > 0 &&
      H_lab.store[RESOURCE_HYDROGEN] > 0
    ) {
      UH_lab.runReaction(L_lab, H_lab);
    }

    if (
      LO_lab &&
      L_lab &&
      O_lab &&
      L_lab.store[RESOURCE_LEMERGIUM_OXIDE] < 3000 &&
      L_lab.store[RESOURCE_LEMERGIUM] > 0 &&
      O_lab.store[RESOURCE_OXYGEN] > 0
    ) {
      LO_lab.runReaction(L_lab, O_lab);
    }

    if (
      GO_lab &&
      GH_lab &&
      O_lab &&
      GH_lab.store[RESOURCE_GHODIUM_OXIDE] < 3000 &&
      GH_lab.store[RESOURCE_GHODIUM] > 0 &&
      O_lab.store[RESOURCE_OXYGEN] > 0
    ) {
      GO_lab.runReaction(GH_lab, O_lab);
    }
  }

  public static boostCreep(creep: Creep): boolean {

    const outputCompound = Labs.MAP.output as MineralBoostConstant;
    const productionLab = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: structure => {
        return structure.structureType === STRUCTURE_LAB && structure.store[outputCompound] > 0;
      }
    }) as StructureLab;



    // Boost Labs
    if (!productionLab) {
      return true;
    }

       creep.say("✨")

    if (
      creep.memory.role === "attacker" &&
      creep.getActiveBodyparts(ATTACK) > 0 &&
      productionLab &&
      outputCompound === RESOURCE_UTRIUM_HYDRIDE
    ) {
      if (!creep.pos.isNearTo(productionLab)) {
        creep.moveTo(productionLab);
        return false;
      }
      productionLab.boostCreep(creep, creep.getActiveBodyparts(ATTACK));
    }

    if (
      creep.memory.role === "harvester" &&
      creep.getActiveBodyparts(WORK) > 0 &&
      productionLab &&
      outputCompound === RESOURCE_UTRIUM_OXIDE
    ) {
      if (!creep.pos.isNearTo(productionLab)) {
        creep.moveTo(productionLab);
        return false;
      }
      productionLab.boostCreep(creep, creep.getActiveBodyparts(WORK));
    }

    if (
      creep.memory.role === "dismantler" &&
      creep.getActiveBodyparts(WORK) > 0 &&
      productionLab &&
      outputCompound === RESOURCE_ZYNTHIUM_HYDRIDE
    ) {
      if (!creep.pos.isNearTo(productionLab)) {
        creep.moveTo(productionLab);
        return false;
      }
      productionLab.boostCreep(creep, creep.getActiveBodyparts(WORK));
    }

    if (creep.getActiveBodyparts(MOVE) > 0 && productionLab && outputCompound === RESOURCE_ZYNTHIUM_OXIDE) {
      if (!creep.pos.isNearTo(productionLab)) {
        creep.moveTo(productionLab);
        return false;
      }
      productionLab.boostCreep(creep, creep.getActiveBodyparts(MOVE));
    }

    if (creep.getActiveBodyparts(CARRY) > 0 && productionLab && outputCompound === RESOURCE_KEANIUM_HYDRIDE) {
      if (!creep.pos.isNearTo(productionLab)) {
        creep.moveTo(productionLab);
        return false;
      }
      productionLab.boostCreep(creep, creep.getActiveBodyparts(CARRY));
    }

    if (
      (creep.memory.role === "builder" || creep.memory.role === "repairer") &&
      creep.getActiveBodyparts(WORK) > 0 &&
      productionLab &&
      outputCompound === RESOURCE_LEMERGIUM_HYDRIDE
    ) {
      if (!creep.pos.isNearTo(productionLab)) {
        creep.moveTo(productionLab);
        return false;
      }
      productionLab.boostCreep(creep, creep.getActiveBodyparts(WORK));
    }

    if (
      creep.memory.role === "healer" &&
      creep.getActiveBodyparts(HEAL) > 0 &&
      productionLab &&
      outputCompound === RESOURCE_LEMERGIUM_OXIDE
    ) {
      if (!creep.pos.isNearTo(productionLab)) {
        creep.moveTo(productionLab);
        return false;
      }
      productionLab.boostCreep(creep, creep.getActiveBodyparts(HEAL));
    }

    if (
      creep.memory.role === "upgrader" &&
      creep.getActiveBodyparts(WORK) > 0 &&
      productionLab &&
      outputCompound === RESOURCE_GHODIUM_HYDRIDE
    ) {
      if (!creep.pos.isNearTo(productionLab)) {
        creep.moveTo(productionLab);
        return false;
      }
      productionLab.boostCreep(creep, creep.getActiveBodyparts(WORK));
    }

    if (creep.getActiveBodyparts(TOUGH) > 0 && productionLab && outputCompound === RESOURCE_GHODIUM_OXIDE) {
      if (!creep.pos.isNearTo(productionLab)) {
        creep.moveTo(productionLab);
        return false;
      }
      productionLab.boostCreep(creep, creep.getActiveBodyparts(TOUGH));
    }

    creep.memory.isBoosted = true;
    return true;
  }
}
