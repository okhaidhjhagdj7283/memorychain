module memory_chain::memory_vault {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};
    use aptos_framework::event;

    // Roles
    const ROLE_OWNER: u8 = 0;
    const ROLE_EDITOR: u8 = 1;
    const ROLE_VIEWER: u8 = 2;
    const ROLE_HEIR: u8 = 3;

    struct MemoryProof has store, drop {
        owner: address,
        family_id_hash: vector<u8>,
        memory_id_hash: vector<u8>,
        file_hash: vector<u8>,
        shelby_ref_hash: vector<u8>,
        created_at: u64,
    }

    struct FamilyVault has store {
        owner: address,
        family_id_hash: vector<u8>,
        members: Table<address, u8>, // address -> role
        heir: address,
    }

    struct VaultRegistry has key {
        families: Table<vector<u8>, FamilyVault>,
        memories: Table<vector<u8>, MemoryProof>,
    }

    #[event]
    struct MemoryRegisteredEvent has drop, store {
        family_id_hash: vector<u8>,
        memory_id_hash: vector<u8>,
        owner: address,
    }

    fun init_registry(account: &signer) {
        if (!exists<VaultRegistry>(signer::address_of(account))) {
            move_to(account, VaultRegistry {
                families: table::new(),
                memories: table::new(),
            });
        }
    }

    public entry fun create_family(account: &signer, family_id_hash: vector<u8>) acquires VaultRegistry {
        init_registry(account);
        let account_addr = signer::address_of(account);
        let registry = borrow_global_mut<VaultRegistry>(account_addr);
        
        let members = table::new<address, u8>();
        table::add(&mut members, account_addr, ROLE_OWNER);

        let vault = FamilyVault {
            owner: account_addr,
            family_id_hash,
            members,
            heir: @0x0,
        };

        table::add(&mut registry.families, family_id_hash, vault);
    }

    public entry fun register_memory(
        account: &signer,
        family_id_hash: vector<u8>,
        memory_id_hash: vector<u8>,
        file_hash: vector<u8>,
        shelby_ref_hash: vector<u8>
    ) acquires VaultRegistry {
        init_registry(account);
        let account_addr = signer::address_of(account);
        let registry = borrow_global_mut<VaultRegistry>(account_addr);

        let proof = MemoryProof {
            owner: account_addr,
            family_id_hash,
            memory_id_hash,
            file_hash,
            shelby_ref_hash,
            created_at: timestamp::now_seconds(),
        };

        table::add(&mut registry.memories, memory_id_hash, proof);

        event::emit(MemoryRegisteredEvent {
            family_id_hash,
            memory_id_hash,
            owner: account_addr,
        });
    }

    public entry fun grant_access(account: &signer, family_id_hash: vector<u8>, member_address: address, role: u8) acquires VaultRegistry {
        let account_addr = signer::address_of(account);
        let registry = borrow_global_mut<VaultRegistry>(account_addr);
        let vault = table::borrow_mut(&mut registry.families, family_id_hash);
        
        assert!(vault.owner == account_addr, 1);
        table::upsert(&mut vault.members, member_address, role);
    }

    public entry fun revoke_access(account: &signer, family_id_hash: vector<u8>, member_address: address) acquires VaultRegistry {
        let account_addr = signer::address_of(account);
        let registry = borrow_global_mut<VaultRegistry>(account_addr);
        let vault = table::borrow_mut(&mut registry.families, family_id_hash);
        
        assert!(vault.owner == account_addr, 1);
        table::remove(&mut vault.members, member_address);
    }

    public entry fun set_heir(account: &signer, family_id_hash: vector<u8>, heir_address: address) acquires VaultRegistry {
        let account_addr = signer::address_of(account);
        let registry = borrow_global_mut<VaultRegistry>(account_addr);
        let vault = table::borrow_mut(&mut registry.families, family_id_hash);
        
        assert!(vault.owner == account_addr, 1);
        vault.heir = heir_address;
    }
}
