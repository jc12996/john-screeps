export enum LowUpkeep {
  Harvesters = 3, // Max Harvester Per Slot
  Carriers = 1, // Per Source Slot
  Builder = 2, // Total For Room
  Repairer = 1.5, // Total for Room
  Upgrader = 3, // Per Source
  Defender = 1, // Total Per Room
  DraftedDefenderTotal = 1,
  Claimers = 1, // Worldwide Count
  Settlers = 8, // Worldwide Count,
  AttackClaimers = 1,
  TOTALDRAFT = 2
}

export enum MediumUpkeep {
  Harvesters = 4, // Max Harvester Per Slot
  Carriers = 1, // Per Source Slot
  Builder = 2, // Per Source
  Repairer = 1.5, // Total for Room
  Upgrader = 3, // Per Source
  Defender = 1, // Total Per Room
  AdditionalDraftedDefenders = 1,
  Claimers = 1, // Worldwide Count
  Settlers = 8 // Worldwide Count
}

export enum HighUpkeep {
  Harvesters = 3, // Max Harvester Per Slot
  Carriers = 1, // Per Source Slot
  Builder = 2, // Per Source
  Repairer = 1.5, // Total for Room
  Upgrader = 2, // Per Source
  Defender = 1, // Total Per Room
  AdditionalDraftedDefenders = 1,
  Claimers = 1, // Worldwide Count
  Settlers = 8 // Worldwide Count
}

export enum SeigeEconomy {
  //ARMY Economy
  TOTAL_ATTACKER_SIZE = 0,
  TOTAL_HEALER_SIZE = 4,
  TOTAL_DISMANTLER_SIZE = 4,
  TOTAL_MEAT_GRINDERS = 1
}

export enum WarTimeEconomy {
  //ARMY Economy
  TOTAL_ATTACKER_SIZE = 3,
  TOTAL_HEALER_SIZE = 2,
  TOTAL_DISMANTLER_SIZE = 0,
  TOTAL_MEAT_GRINDERS = 0,
  TOTAL_SCOUT_SIZE = 1
}

export enum PeaceTimeEconomy {
  //ARMY Economy
  TOTAL_ATTACKER_SIZE = 2,
  TOTAL_HEALER_SIZE = 0,
  TOTAL_DISMANTLER_SIZE = 0,
  TOTAL_MEAT_GRINDERS = 0,
  TOTAL_SCOUT_SIZE = 1
}

export enum SquadEconomy {
  //ARMY Economy
  TOTAL_ATTACKER_SIZE = 3,
  TOTAL_HEALER_SIZE = 5,
  TOTAL_DISMANTLER_SIZE = 0,
  TOTAL_MEAT_GRINDERS = 0,
  TOTAL_SCOUT_SIZE = 0
}
