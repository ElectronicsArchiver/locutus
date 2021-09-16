mod config;
pub mod conn_manager;
mod message;
mod node;
mod operations;
mod probe_proto;
mod ring_proto;

pub use conn_manager::PeerKey;
pub use node::NodeConfig;

type StdResult<T, E> = std::result::Result<T, E>;