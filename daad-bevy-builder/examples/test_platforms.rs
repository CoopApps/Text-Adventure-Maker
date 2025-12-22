// Test platform selector - compile for different targets
use daad_bevy_builder::daad::{game::DaadGame, codegen::DaadCodeGenerator};
use daad_bevy_builder::launcher::{DaadLauncher, DrcTarget};
use std::path::PathBuf;

fn main() {
    println!("🎯 Testing Platform Selector\n");

    let game = DaadGame::default();
    let code = DaadCodeGenerator::generate(&game);

    // Test multiple platforms
    let platforms = vec![
        (DrcTarget::ZXSpectrum, "ZX Spectrum"),
        (DrcTarget::AmstradCPC, "Amstrad CPC"),
        (DrcTarget::HTML, "HTML (Web)"),
        (DrcTarget::Commodore64, "Commodore 64"),
        (DrcTarget::Amiga, "Amiga"),
    ];

    std::fs::create_dir_all("./exports").unwrap();

    for (target, name) in platforms {
        println!("📦 Compiling for: {}", name);

        let filename = format!("test_game_{}", target.as_str().to_lowercase());
        let sce_path = format!("./exports/{}.sce", filename);

        std::fs::write(&sce_path, &code).unwrap();

        match DaadLauncher::auto_detect() {
            Ok(launcher) => {
                match launcher.compile_sce_with_output(
                    &PathBuf::from(&sce_path),
                    target,
                    None,
                    None,
                ) {
                    Ok((json_path, _output)) => {
                        println!("   ✅ SUCCESS: {}\n", json_path.display());
                    }
                    Err(e) => {
                        println!("   ❌ FAILED: {}\n", e);
                    }
                }
            }
            Err(e) => {
                println!("   ❌ DRC NOT FOUND: {}\n", e);
                break;
            }
        }
    }

    println!("🎉 Platform selector test complete!");
}
