export enum LowUpkeep {
    Harvesters = 3,// Max Harvester Per Slot
    Carriers  = 1,// Per Source Slot
    Builder = 3,// Total For Room
    Repairer = 1,// Total for Room
    Upgrader = 2,// Per Source
    Defender = 1,// Total Per Room
    DraftedDefenderTotal = 1,
    Claimers = 1,// Worldwide Count
    Settlers = 8,// Worldwide Count,
    Miners = 3.25,
    AttackClaimers = 1,
    TOTALDRAFT = 0
}

export enum MediumUpkeep {
    Harvesters = 3,// Max Harvester Per Slot
    Carriers  = 1,// Per Source Slot
    Builder = 2,// Per Source
    Repairer = 2,// Total for Room
    Upgrader = 2,// Per Source
    Defender = 1,// Total Per Room
    AdditionalDraftedDefenders = 2,
    Claimers = 1,// Worldwide Count
    Settlers = 8,// Worldwide Count
    Miners = 3
}

export enum HighUpkeep {
    Harvesters = 3,// Max Harvester Per Slot
    Carriers  = 1,// Per Source Slot
    Builder = 1,// Per Source
    Repairer = 2,// Total for Room
    Upgrader = 2,// Per Source
    Defender = 1,// Total Per Room
    AdditionalDraftedDefenders = 3,
    Claimers = 1,// Worldwide Count
    Settlers = 8,// Worldwide Count
    Miners = 3
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
    TOTAL_ATTACKER_SIZE = 4,
    TOTAL_HEALER_SIZE = 1,
    TOTAL_DISMANTLER_SIZE =0,
    TOTAL_MEAT_GRINDERS = 0,
    TOTAL_SCOUT_SIZE = 1

}

export enum PeaceTimeEconomy {
    //ARMY Economy
    TOTAL_ATTACKER_SIZE =1,
    TOTAL_HEALER_SIZE =0,
    TOTAL_DISMANTLER_SIZE = 0,
    TOTAL_MEAT_GRINDERS = 0,
    TOTAL_SCOUT_SIZE = 1

}


