//! This module defines a `BiMultiMap` structure that allows bidirectional mapping between keys and values.
//! It provides functionality to insert, retrieve, and remove elements, allowing multiple values for a single key
//! and supporting reverse lookup from values to keys.

use std::collections::{HashMap};
use indexmap::IndexSet;


/// A `BiMultiMap` is a bidirectional multi-map that allows mapping keys to multiple values
/// and also allows reverse lookup from values to keys. Each key can be associated with multiple values,
/// and each value can map back to a single key.
#[derive(Debug)]
pub struct BiMultiMap<K, V> {
    /// Map keys to a set of values
    key_to_values: HashMap<K, IndexSet<V>>,

    /// Maps values back to keys
    value_to_key: HashMap<V, K>,
}

impl<K, V> BiMultiMap<K, V>
    where
        /// Key must be hashable, comparable for equality, and cloneable
        K: std::hash::Hash + Eq + Clone,

        /// Value must be hashable, comparable for equality, and cloneable
        V: std::hash::Hash + Eq + Clone,
{
    pub fn new() -> Self {
        Self {
            key_to_values: HashMap::new(),
            value_to_key: HashMap::new(),
        }
    }

    /// Inserts a key-value pair into the `BiMultiMap`.
    /// If the value is already associated with a different key, it is moved to the new key's values list.
    ///
    /// # Arguments
    /// * `key`: The key to insert.
    /// * `value`: The value to insert.
    pub fn insert(&mut self, key: K, value: V) {
        if let Some(existing_key) = self.value_to_key.get(&value) {
            if existing_key != &key {
                self.key_to_values.get_mut(existing_key).unwrap().swap_remove(&value);
                if self.key_to_values.get(existing_key).unwrap().is_empty() {
                    self.key_to_values.remove(existing_key);
                }
            }
        }

        self.key_to_values
            .entry(key.clone())
            .or_insert_with(IndexSet::new)
            .insert(value.clone());
        self.value_to_key.insert(value, key);
    }

    /// Retrieves the set of values associated with a key.
    ///
    /// # Arguments
    /// * `key`: The key to retrieve values for.
    ///
    /// # Returns
    /// An optional reference to the set of values associated with the key.
    pub fn get_by_left(&self, key: &K) -> Option<&IndexSet<V>> {
        self.key_to_values.get(key)
    }


    /// Retrieves a mutable reference to the set of values associated with a key.
    ///
    /// # Arguments
    /// * `key`: The key to retrieve values for.
    ///
    /// # Returns
    /// An optional mutable reference to the set of values associated with the key.
    pub fn get_by_left_mut(&mut self, key: &K) -> Option<&mut IndexSet<V>> {
        self.key_to_values.get_mut(key)
    }


    /// Retrieves the key associated with a value.
    ///
    /// # Arguments
    /// * `value`: The value to retrieve the key for.
    ///
    /// # Returns
    /// An optional reference to the key associated with the value.
    pub fn get_by_right(&self, value: &V) -> Option<&K> {
        self.value_to_key.get(value)
    }


    /// Retrieves a mutable reference to the key associated with a value.
    ///
    /// # Arguments
    /// * `value`: The value to retrieve the key for.
    ///
    /// # Returns
    /// An optional mutable reference to the key associated with the value.
    pub fn get_by_right_mut(&mut self, value: &V) -> Option<&mut K> {
        self.value_to_key.get_mut(value)
    }


    /// Returns a reference to the internal `key_to_values` hashmap.
    ///
    /// # Returns
    /// A reference to the `HashMap<K, IndexSet<V>>`.
    pub fn get_key_to_values_hashmap(&self) -> &HashMap<K, IndexSet<V>> {
        &self.key_to_values
    }


    /// Removes all key-value pairs associated with a given key.
    ///
    /// # Arguments
    /// * `key`: The key to remove from the map.
    pub fn remove_by_left(&mut self, key: &K) {
        if let Some(values) = self.key_to_values.remove(key) {
            for value in values {
                self.value_to_key.remove(&value);
            }
        }
    }


    /// Removes the key-value pair associated with a given value.
    ///
    /// # Arguments
    /// * `value`: The value to remove from the map.
    pub fn remove_by_right(&mut self, value: &V) {
        if let Some(key) = self.value_to_key.remove(value) {
            if let Some(values) = self.key_to_values.get_mut(&key) {
                values.swap_remove(value);
                if values.is_empty() {
                    self.key_to_values.remove(&key);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::BiMultiMap;

    #[test]
    fn test_insert_and_get() {
        let mut multimap = BiMultiMap::new();

        multimap.insert("key1", "value1");
        multimap.insert("key1", "value2");
        multimap.insert("key2", "value3");

        let values_key1 = multimap.get_by_left(&"key1").unwrap();
        assert!(values_key1.contains(&"value1"));
        assert!(values_key1.contains(&"value2"));
        assert_eq!(values_key1.len(), 2);

        let values_key2 = multimap.get_by_left(&"key2").unwrap();
        assert!(values_key2.contains(&"value3"));
        assert_eq!(values_key2.len(), 1);
    }

    #[test]
    fn test_get_left_by_right() {
        let mut multimap = BiMultiMap::new();

        multimap.insert("key1", "value1");
        multimap.insert("key1", "value2");
        multimap.insert("key2", "value3");

        assert_eq!(multimap.get_by_right(&"value1"), Some(&"key1"));
        assert_eq!(multimap.get_by_right(&"value2"), Some(&"key1"));
        assert_eq!(multimap.get_by_right(&"value3"), Some(&"key2"));
    }

    #[test]
    fn test_remove_by_left() {
        let mut multimap = BiMultiMap::new();

        multimap.insert("key1", "value1");
        multimap.insert("key1", "value2");
        multimap.insert("key2", "value3");

        multimap.remove_by_left(&"key1");

        assert!(multimap.get_by_left(&"key1").is_none());
        assert!(multimap.get_by_right(&"value1").is_none());
        assert!(multimap.get_by_right(&"value2").is_none());
        assert_eq!(multimap.get_by_right(&"value3"), Some(&"key2"));
    }

    #[test]
    fn test_remove_by_right() {
        let mut multimap = BiMultiMap::new();

        multimap.insert("key1", "value1");
        multimap.insert("key1", "value2");
        multimap.insert("key2", "value3");

        multimap.remove_by_right(&"value1");

        let values_key1 = multimap.get_by_left(&"key1").unwrap();
        assert!(!values_key1.contains(&"value1"));
        assert!(values_key1.contains(&"value2"));
        assert_eq!(values_key1.len(), 1);

        assert!(multimap.get_by_right(&"value1").is_none());
    }

    #[test]
    fn test_right_replacement() {
        let mut multimap = BiMultiMap::new();

        multimap.insert("key1", "value1");
        multimap.insert("key1", "value2");

        multimap.insert("key2", "value1");

        assert_eq!(multimap.get_by_right(&"value1"), Some(&"key2"));
        assert!(!multimap.get_by_left(&"key1").unwrap().contains(&"value1"));
    }

    #[test]
    fn test_insert_remove() {
        let mut multimap = BiMultiMap::new();

        multimap.insert("key1", "value1");
        multimap.insert("key1", "value2");
        multimap.remove_by_left(&"key1");
        assert_eq!(multimap.get_by_left(&"key1"), None)
    }

    #[test]
    fn test_insert_remove2() {
        let mut multimap = BiMultiMap::new();

        multimap.insert("key1", "value1");
        multimap.insert("key1", "value2");
        multimap.remove_by_right(&"value1");
        multimap.remove_by_right(&"value2");
        assert_eq!(multimap.get_by_left(&"key1"), None)
    }
}