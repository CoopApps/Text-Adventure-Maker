// Test DRC compilation without GUI
use daad_bevy_builder::daad::{game::DaadGame, codegen::DaadCodeGenerator};
use daad_bevy_builder::launcher::{DaadLauncher, DrcTarget};
use std::path::PathBuf;

fn main() {
    println!("🚀 Testing DRC Compilation (No GUI)\n");

    // Create a game
    let game = DaadGame::default();
    println!("✅ Created game: {}", game.title);
    println!("   - {} locations", game.locations.len());
    println!("   - {} objects", game.objects.len());
    println!("   - {} vocabulary words\n", game.vocabulary.len());

    // Generate DAAD code
    let code = DaadCodeGenerator::generate(&game);
    println!("✅ Generated {} lines of DAAD code\n", code.lines().count());

    // Save to file
    std::fs::create_dir_all("./exports").unwrap();
    std::fs::write("./exports/test_game.sce", &code).unwrap();
    println!("✅ Saved to: ./exports/test_game.sce\n");

    // Compile with DRC (same as GUI button does!)
    println!("🔧 Compiling with DRC...");
    match DaadLauncher::auto_detect() {
        Ok(launcher) => {
            match launcher.compile_sce_with_output(
                &PathBuf::from("./exports/test_game.sce"),
                DrcTarget::ZXSpectrum,
                None,
                None,
            ) {
                Ok((json_path, output)) => {
                    println!("\n✅ COMPILATION SUCCESSFUL!\n");
                    println!("📦 Output: {}\n", json_path.display());
                    println!("=== DRC Output ===");
                    println!("{}", output.combined_output());
                    println!("==================\n");
                    println!("🎉 This is exactly what the GUI 'Build & Test' button does!");
                }
                Err(e) => {
                    println!("\n❌ COMPILATION FAILED\n");
                    println!("Error: {}", e);
                }
            }
        }
        Err(e) => {
            println!("\n❌ DRC NOT FOUND\n");
            println!("Error: {}", e);
        }
    }
}
