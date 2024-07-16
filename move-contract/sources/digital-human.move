module digital_human::digital_id {
	use std::signer;
	use std::error;
	use std::option::{Self, Option};
	use std::string::{Self, String};
	use std::ed25519;

	use aptos_std::comparator;

	use aptos_framework::event;
  	use aptos_framework::object::{Self, Object};

	use aptos_framework::account::{Self, SignerCapability};
	use aptos_framework::resource_account;

	use aptos_token_objects::token::{Self, MutatorRef};
	use aptos_token_objects::collection::{Self, Collection};
	use aptos_token_objects::royalty::{Royalty};

	const EDigitalIdExists: u64 = 0;
	const EDigitalIdDoesNotExist: u64 = 1;
	const EDataIsAlreadyVerified: u64 = 2;
	const EAccessDenied: u64 = 3;

	struct State has key, store {
		signer_cap: SignerCapability,
		collection: Object<Collection>,
		
		total: u64
	}

	struct DigitalId has key {
		token_id: address,
		iris: Option<address>,
		fingerprint: Option<address>,

		mutator_ref: MutatorRef
	}

	#[event]
    struct CreateDigitalId has drop, store {
        creator: address,
        digital_id: address,
    }

	#[event]
	struct VerifyDigitalIdData has drop, store {
		owner: address,
		digital_id: address,
		type: String,
	}

	fun init_module(resource: &signer) {
		let signer_cap = resource_account::retrieve_resource_account_cap(resource, @owner);

		let constructor_ref = &collection::create_unlimited_collection(
			resource, 
			string::utf8(b"Digital Human Project on Aptos"), 
			string::utf8(b"Digital Human"), 
			option::none<Royalty>(),
			string::utf8(b"URI")
		);

		move_to<State>(resource, State {
			signer_cap,
			collection: object::object_from_constructor_ref<Collection>(constructor_ref),
			total: 0
		});
	}

	entry fun create_digital_id(sender: &signer, metadata: String, signature: vector<u8>) acquires State {
		assert!(is_creator(signature, metadata), error::permission_denied(EAccessDenied));
		assert!(!exists<DigitalId>(signer::address_of(sender)), error::already_exists(EDigitalIdExists));

		let state = borrow_global_mut<State>(@digital_human);
		let resource_signer = &account::create_signer_with_capability(&state.signer_cap);

		let constructor_ref = token::create(
			resource_signer, 
			collection::name<Collection>(*&state.collection), 
			string::utf8(b"Digital Id - is a Human Passport"), 
			string::utf8(b"Digital ID"), 
			option::none<Royalty>(), 
			metadata
		);

		let digital_id_signer = object::generate_signer(&constructor_ref);
		let digital_id_address = signer::address_of(&digital_id_signer);

		object::transfer_raw(resource_signer, digital_id_address, signer::address_of(sender));

		move_to<DigitalId>(sender, DigitalId {
			token_id: digital_id_address,
			iris: option::none<address>(),
			fingerprint: option::none<address>(),

			mutator_ref: token::generate_mutator_ref(&constructor_ref)
		});

		*&mut state.total = *&mut state.total + 1;

		event::emit(CreateDigitalId {
			creator: signer::address_of(sender),
			digital_id: digital_id_address
		});
	}

	entry fun verify_data(sender: &signer, new_digital_id_metadata: String, data_type: String, data_metadata: String, signature: vector<u8>) acquires State, DigitalId {
		assert!(is_creator(signature, new_digital_id_metadata), error::permission_denied(EAccessDenied));
		assert!(exists<DigitalId>(signer::address_of(sender)), error::not_found(EDigitalIdDoesNotExist));

		let digital_id = borrow_global_mut<DigitalId>(signer::address_of(sender));
		let is_iris = comparator::is_equal(&comparator::compare<String>(&data_type, &string::utf8(b"iris")));

		assert!(option::is_none<address>(if (is_iris) &digital_id.iris else &digital_id.fingerprint), error::already_exists(EDataIsAlreadyVerified));

		let state = borrow_global<State>(@digital_human);
		let resource_signer = &account::create_signer_with_capability(&state.signer_cap);

		let constructor_ref = token::create(
			resource_signer, 
			collection::name<Collection>(*&state.collection), 
			string::utf8(if (is_iris) b"Verified Iris Data" else b"Verified Fingerprint Data"), 
			string::utf8(if (is_iris) b"Iris" else b"Fingerprint"), 
			option::none<Royalty>(), 
			data_metadata
		);

		let verified_data_signer = object::generate_signer(&constructor_ref);
		let verified_data_address = signer::address_of(&verified_data_signer);

		let data_option_address: Option<address> = option::some<address>(verified_data_address);
		if (is_iris) {
			*&mut digital_id.iris = data_option_address;
		} else {
			*&mut digital_id.fingerprint = data_option_address;
		};

		token::set_uri(&digital_id.mutator_ref, new_digital_id_metadata);
		object::transfer_raw(resource_signer, verified_data_address, *&mut digital_id.token_id);

		event::emit(VerifyDigitalIdData {
			owner: signer::address_of(sender),
			digital_id: *&mut digital_id.token_id,
			type: data_type,
		});
	}

	fun is_creator(signature_bytes: vector<u8>, message: String): bool {
		let signature = ed25519::new_signature_from_bytes(signature_bytes);
		let public_key = ed25519::new_unvalidated_public_key_from_bytes(x"84fead427fcd0e51e74cc22db250d2b540d6f431dbe85fcbc2ddac2ab4431664");

		ed25519::signature_verify_strict(&signature, &public_key, *string::bytes(&message))
	}

	#[view]
	public fun get_digital_token_id(person: address): address acquires DigitalId {
		assert!(has_digital_id(person), error::not_found(EDigitalIdDoesNotExist));
		*&borrow_global<DigitalId>(person).token_id
	}

	#[view]
	public fun has_digital_id(person: address): bool {
		exists<DigitalId>(person)
	}

	#[view]
	public fun get_total_people(): u64 acquires State {
		*&borrow_global<State>(@digital_human).total
	}
}