export enum LowUpkeep {
    Harvesters = 3,// Max Harvester Per Slot
    Carriers  = 1,// Per Source Slot
    Builder = 2,// Total For Room
    Repairer = 1,// Per Source
    Upgrader = 2,// Per Source
    Defender = 1,// Total Per Room
    DraftedDefenderTotal = 1,
    Claimers = 1,// Worldwide Count
    Settlers = 8,// Worldwide Count,
    Miners = 8
}

export enum MediumUpkeep {
    Harvesters = 2,// Max Harvester Per Slot
    Carriers  = 1,// Per Source Slot
    Builder = 1,// Per Source
    Repairer = 0,// Per Source
    Upgrader = 2,// Per Source
    Defender = 2,// Total Per Room
    AdditionalDraftedDefenders = 2,
    Claimers = 1,// Worldwide Count
    Settlers = 8,// Worldwide Count
    Miners = 6
}

export enum HighUpkeep {
    Harvesters = 2,// Max Harvester Per Slot
    Carriers  = 1,// Per Source Slot
    Builder = .5,// Per Source
    Repairer = 0,// Per Source
    Upgrader = 2,// Per Source
    Defender = 3,// Total Per Room
    AdditionalDraftedDefenders = 3,
    Claimers = 1,// Worldwide Count
    Settlers = 8,// Worldwide Count
    Miners = 4
}

export enum SeigeEconomy {
    //ARMY Economy
    TOTAL_ATTACKER_SIZE = 3,
    TOTAL_HEALER_SIZE = 9,
    TOTAL_DISMANTLER_SIZE = 6,
    TOTAL_MEAT_GRINDERS = 3

}

export enum WarTimeEconomy {
    //ARMY Economy
    TOTAL_ATTACKER_SIZE = 12,
    TOTAL_HEALER_SIZE = 6,
    TOTAL_DISMANTLER_SIZE = 0,
    TOTAL_MEAT_GRINDERS = 0

}

export enum PeaceTimeEconomy {
    //ARMY Economy
    TOTAL_ATTACKER_SIZE = 3,
    TOTAL_HEALER_SIZE = 1,
    TOTAL_DISMANTLER_SIZE = 0,
    TOTAL_MEAT_GRINDERS = 0

}


