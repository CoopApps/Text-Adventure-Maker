// Test HTML game launcher - compile to HTML without opening browser
use daad_bevy_builder::daad::{game::DaadGame, codegen::DaadCodeGenerator};
use daad_bevy_builder::launcher::{DaadLauncher, DrcTarget};
use std::path::PathBuf;

fn main() {
    println!("🌐 Testing HTML Game Launcher\n");

    let game = DaadGame::default();
    let code = DaadCodeGenerator::generate(&game);

    std::fs::create_dir_all("./exports").unwrap();

    // Compile to HTML
    let sce_path = "./exports/test_html_game.sce";
    let html_path = "./exports/test_html_game.html";

    println!("📝 Writing DAAD source...");
    std::fs::write(sce_path, &code).unwrap();

    println!("🔧 Compiling to HTML with DRC...");
    match DaadLauncher::auto_detect() {
        Ok(launcher) => {
            match launcher.compile_sce_with_output(
                &PathBuf::from(sce_path),
                DrcTarget::HTML,
                None,
                Some(PathBuf::from(html_path)),
            ) {
                Ok((html_file, output)) => {
                    println!("\n✅ HTML COMPILATION SUCCESSFUL!\n");
                    println!("📦 Output: {}\n", html_file.display());
                    println!("=== DRC Output ===");
                    println!("{}", output.combined_output());
                    println!("==================\n");

                    // Check if HTML file exists
                    if html_file.exists() {
                        let size = std::fs::metadata(&html_file).unwrap().len();
                        println!("✅ HTML file created: {} bytes", size);
                        println!("\n🌐 To play, open this file in your browser:");
                        println!("   file://{}", std::fs::canonicalize(html_file).unwrap().display());
                    } else {
                        println!("❌ HTML file not found!");
                    }
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

    println!("\n🎉 HTML launcher test complete!");
}
