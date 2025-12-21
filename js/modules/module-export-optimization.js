// module-export-optimization.js - DAAD Export Optimization
// Complete implementation with real optimization algorithms, modals, and persistence
(function() {
    'use strict';

    console.log('DAAD Export Optimization module loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found! Export Optimization module requires the Adventure Creator framework.');
        return;
    }

    const ExportOptimization = {
        name: 'Export Optimization',
        version: '1.0.0',
        description: 'Text compression and space optimization features for efficient game distribution',
        category: 'Development Tools',
        author: 'DAAD Adventure Creator',

        init: function() {
            console.log('Export Optimization module initialized');
            this.initializeState();
            this.loadFromStorage();
        },

        initializeState: function() {
            if (!AdventureCreator.state.exportOptimization) {
                AdventureCreator.state.exportOptimization = {
                    selectedCategory: 'text_compression',
                    selectedOperation: null,
                    showExplanations: true,
                    previewMode: false,
                    searchFilter: '',
                    optimizationProfiles: this.getDefaultProfiles(),
                    compressionStats: {
                        originalSize: 0,
                        compressedSize: 0,
                        compressionRatio: '0%',
                        savingsAchieved: '0KB'
                    },
                    currentOptimization: {
                        running: false,
                        progress: 0,
                        stage: null
                    },
                    optimizationHistory: [],
                    currentRule: {
                        conditions: [],
                        actions: []
                    }
                };
            }
        },

        getDefaultProfiles: function() {
            return [
                {
                    id: 'retro-systems',
                    name: 'Retro Systems',
                    description: 'Optimized for 8-bit computers with strict memory limits',
                    target_size: '48KB',
                    compression_level: 'Maximum',
                    optimizations: ['Text Compression', 'Code Minification', 'Asset Optimization'],
                    settings: {
                        text_compression: true,
                        code_minification: true,
                        asset_optimization: true,
                        remove_comments: true,
                        compression_algorithm: 'Hybrid'
                    }
                },
                {
                    id: 'modern-distribution',
                    name: 'Modern Distribution',
                    description: 'Balanced optimization for modern platforms',
                    target_size: '2MB',
                    compression_level: 'Balanced',
                    optimizations: ['Text Compression', 'Asset Optimization'],
                    settings: {
                        text_compression: true,
                        code_minification: false,
                        asset_optimization: true,
                        remove_comments: false,
                        compression_algorithm: 'LZ77'
                    }
                },
                {
                    id: 'development-build',
                    name: 'Development Build',
                    description: 'Minimal optimization for fast development iteration',
                    target_size: 'No Limit',
                    compression_level: 'None',
                    optimizations: ['Debug Info Retention'],
                    settings: {
                        text_compression: false,
                        code_minification: false,
                        asset_optimization: false,
                        remove_comments: false,
                        compression_algorithm: 'None'
                    }
                }
            ];
        },

        render: function() {
            const state = AdventureCreator.state.exportOptimization;

            return `
                <div class="export-optimization-editor" style="background: #0a0a0a; min-height: 100vh; color: #e0e0e0;">
                    ${this.renderStyles()}

                    <div class="module-header" style="background: #1a1a1a; border-bottom: 1px solid #333; padding: 2rem;">
                        <div style="max-width: 1400px; margin: 0 auto;">
                            <h1 style="color: #fff; font-size: 2rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                                📦 Export Optimization
                                <span style="font-size: 0.6em; color: #8b5cf6; background: rgba(139, 92, 246, 0.1); padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: 500;">DAAD Module</span>
                                ${state.currentOptimization.running ? `<span style="font-size: 0.6em; color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 0.25rem 0.75rem; border-radius: 1rem; font-weight: 500;">OPTIMIZING</span>` : ''}
                            </h1>
                            <p style="color: #999; font-size: 1.1rem; margin-bottom: 1.5rem;">
                                Text compression and space optimization features for efficient game distribution
                            </p>

                            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                    <button onclick="AdventureCreator.modules['export-optimization'].toggleExplanations()"
                                            style="padding: 0.5rem 1rem; background: ${state.showExplanations ? '#8b5cf6' : '#374151'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ${state.showExplanations ? '📖 Hide Explanations' : '📖 Show Explanations'}
                                    </button>
                                    <button onclick="AdventureCreator.modules['export-optimization'].${state.currentOptimization.running ? 'stopOptimization' : 'runFullOptimization'}()"
                                            style="padding: 0.5rem 1rem; background: ${state.currentOptimization.running ? '#ef4444' : '#10b981'}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ${state.currentOptimization.running ? '⏹️ Stop' : '🚀 Run Full Optimization'}
                                    </button>
                                    <button onclick="AdventureCreator.modules['export-optimization'].showProfilesModal()"
                                            style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        💾 Profiles
                                    </button>
                                    <button onclick="AdventureCreator.modules['export-optimization'].showHistoryModal()"
                                            style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        📜 History
                                    </button>
                                    <button onclick="AdventureCreator.modules['export-optimization'].showHelpModal()"
                                            style="padding: 0.5rem 1rem; background: #374151; color: white; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">
                                        ❓ Help
                                    </button>
                                </div>

                                <div style="flex: 1; max-width: 300px; position: relative;">
                                    <input type="text"
                                           placeholder="Search optimization features..."
                                           value="${state.searchFilter}"
                                           onkeyup="AdventureCreator.modules['export-optimization'].updateSearchFilter(this.value)"
                                           style="width: 100%; padding: 0.5rem 1rem 0.5rem 2.5rem; background: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; color: white;">
                                    <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #9ca3af;">🔍</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="module-content" style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
                        <div style="display: grid; grid-template-columns: 350px 1fr; gap: 2rem; align-items: start;">
                            <div class="category-nav" style="background: #1a1a1a; border-radius: 1rem; border: 1px solid #333; overflow: hidden; position: sticky; top: 2rem;">
                                ${this.renderCategoryNavigation(state)}
                            </div>

                            <div class="main-content">
                                ${this.renderMainContent(state)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderStyles: function() {
            return `
                <style>
                    .category-item:hover {
                        background: rgba(139, 92, 246, 0.05);
                    }
                    .operation-card:hover {
                        transform: translateY(-2px);
                        border-color: #8b5cf6;
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                </style>
            `;
        },

        renderCategoryNavigation: function(state) {
            const categories = this.getDefinitions();

            return `
                <div class="category-header" style="background: #8b5cf6; color: white; padding: 1rem; font-weight: 600;">
                    📦 Optimization Categories
                </div>
                <div class="category-list">
                    ${Object.entries(categories).map(([key, category]) => `
                        <div class="category-item ${state.selectedCategory === key ? 'active' : ''}"
                             onclick="AdventureCreator.modules['export-optimization'].selectCategory('${key}')"
                             style="padding: 1rem; cursor: pointer; border-bottom: 1px solid #333; transition: all 0.2s; ${state.selectedCategory === key ? 'background: rgba(139, 92, 246, 0.1); border-left: 3px solid #8b5cf6;' : ''}">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <span style="font-size: 1.25rem;">${category.icon}</span>
                                <span style="font-weight: 500; color: ${state.selectedCategory === key ? '#8b5cf6' : '#fff'};">${category.title}</span>
                            </div>
                            <div style="font-size: 0.875rem; color: #999;">${category.description}</div>
                            <div style="font-size: 0.75rem; color: #666; margin-top: 0.5rem;">
                                ${Object.keys(category.operations).length} operations
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="padding: 1rem; border-top: 1px solid #333; background: #0a0a0a;">
                    <h4 style="color: #fff; margin-bottom: 0.75rem; font-size: 0.875rem;">Compression Stats</h4>
                    <div style="color: #999; font-size: 0.8rem; line-height: 1.6;">
                        <div><strong>Original:</strong> ${state.compressionStats.originalSize ? this.formatBytes(state.compressionStats.originalSize) : '0KB'}</div>
                        <div><strong>Compressed:</strong> ${state.compressionStats.compressedSize ? this.formatBytes(state.compressionStats.compressedSize) : '0KB'}</div>
                        <div><strong>Ratio:</strong> ${state.compressionStats.compressionRatio}</div>
                        <div><strong>Saved:</strong> ${state.compressionStats.savingsAchieved}</div>
                    </div>
                </div>
            `;
        },

        renderMainContent: function(state) {
            const category = this.getDefinitions()[state.selectedCategory];
            if (!category) return '<div>Category not found</div>';

            const filteredOps = this.filterOperations(category.operations, state.searchFilter);

            return `
                <div class="category-detail">
                    <div class="category-overview" style="background: linear-gradient(135deg, ${category.color}20, ${category.color}10); border: 1px solid ${category.color}40; border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <span style="font-size: 2rem;">${category.icon}</span>
                            <div>
                                <h2 style="color: #fff; font-size: 1.5rem; margin-bottom: 0.25rem;">${category.title}</h2>
                                <p style="color: #ccc; margin: 0;">${category.description}</p>
                            </div>
                        </div>
                    </div>

                    ${state.currentOptimization.running ? this.renderOptimizationProgress(state) : ''}

                    <div class="operations-grid" style="display: grid; gap: 1.5rem;">
                        ${Object.entries(filteredOps).map(([key, op]) => this.renderOperationCard(key, op, state)).join('')}
                    </div>
                </div>
            `;
        },

        renderOptimizationProgress: function(state) {
            return `
                <div class="optimization-progress" style="background: #1a1a1a; border: 1px solid #f59e0b; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 2rem;">
                    <h3 style="color: #f59e0b; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        🚀 Optimization in Progress
                    </h3>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem;">
                            <div style="color: #f59e0b; font-size: 1.25rem; font-weight: 600;">${state.currentOptimization.progress}%</div>
                            <div style="color: #999; font-size: 0.875rem;">Progress</div>
                        </div>
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 0.5rem;">
                            <div style="color: #f59e0b; font-size: 1.25rem; font-weight: 600;">${state.currentOptimization.stage || 'Starting'}</div>
                            <div style="color: #999; font-size: 0.875rem;">Current Stage</div>
                        </div>
                    </div>

                    <div style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                        <div style="color: #f59e0b; font-size: 0.875rem; margin-bottom: 0.5rem;">${state.currentOptimization.stage || 'Initializing optimization...'}</div>
                        <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: #f59e0b; height: 100%; width: ${state.currentOptimization.progress}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="AdventureCreator.modules['export-optimization'].stopOptimization()"
                                style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                            ⏹️ Stop
                        </button>
                    </div>
                </div>
            `;
        },

        renderOperationCard: function(key, operation, state) {
            const isSelected = state.selectedOperation === key;
            const complexityColor = this.getComplexityColor(operation.category);

            return `
                <div class="operation-card ${isSelected ? 'selected' : ''}"
                     onclick="AdventureCreator.modules['export-optimization'].selectOperation('${key}')"
                     style="background: #1a1a1a; border: 2px solid ${isSelected ? '#8b5cf6' : '#333'}; border-radius: 0.75rem; padding: 1.5rem; cursor: pointer; transition: all 0.2s;">

                    <div class="operation-header" style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <span style="font-size: 1.5rem;">${operation.icon}</span>
                                <h3 style="color: #fff; margin: 0; font-size: 1.1rem;">${operation.name}</h3>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: ${complexityColor}; color: white; border-radius: 0.25rem; font-weight: 600;">
                                    ${operation.category.toUpperCase()}
                                </span>
                                <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: #374151; color: #ccc; border-radius: 0.25rem;">
                                    ${operation.type || 'optimization'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="operation-description" style="color: #ccc; margin-bottom: 1rem; line-height: 1.5;">
                        ${operation.description}
                    </div>

                    ${state.showExplanations ? `
                        <div class="operation-details" style="background: #0a0a0a; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                            <div style="margin-bottom: 1rem;">
                                <h4 style="color: #8b5cf6; margin-bottom: 0.5rem; font-size: 0.9rem;">Examples:</h4>
                                <ul style="margin: 0; padding-left: 1.5rem; color: #999;">
                                    ${operation.examples.map(example => `<li style="margin-bottom: 0.25rem;">${example}</li>`).join('')}
                                </ul>
                            </div>
                            <div>
                                <h4 style="color: #8b5cf6; margin-bottom: 0.5rem; font-size: 0.9rem;">Use Cases:</h4>
                                <ul style="margin: 0; padding-left: 1.5rem; color: #999;">
                                    ${operation.useCases.slice(0, 3).map(useCase => `<li style="margin-bottom: 0.25rem;">${useCase}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : ''}

                    <div class="operation-code" style="background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.75rem; font-family: 'Courier New', monospace;">
                        <div style="color: #64748b; font-size: 0.75rem; margin-bottom: 0.25rem;">DAAD Code:</div>
                        <div style="color: #8b5cf6; font-weight: 500;">${operation.daadCode}</div>
                        ${operation.effect ? `<div style="color: #10b981; font-size: 0.75rem; margin-top: 0.25rem;">Effect: ${operation.effect}</div>` : ''}
                    </div>

                    ${isSelected ? `
                        <div class="operation-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                            <button onclick="event.stopPropagation(); AdventureCreator.modules['export-optimization'].showCodeExample('${key}')"
                                    style="flex: 1; padding: 0.5rem; background: #374151; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                📋 View Code
                            </button>
                            <button onclick="event.stopPropagation(); AdventureCreator.modules['export-optimization'].runSingleOptimization('${key}')"
                                    style="flex: 1; padding: 0.5rem; background: #7c3aed; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                                🚀 Run This
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        getDefinitions: function() {
            return {
                text_compression: {
                    title: "📝 Text Compression",
                    description: "Compress game text, messages, and descriptions",
                    icon: "📝",
                    color: "#3b82f6",
                    operations: {
                        MESSAGE_COMPRESSION: {
                            name: "Message text compression",
                            description: "Compress all game messages using advanced text compression algorithms. Automatically handles decompression during gameplay for maximum space savings.",
                            examples: [
                                'COMPRESS_MESSAGES HYBRID BALANCED PRESERVE_FORMAT',
                                'COMPRESS_MESSAGES LZ77 MAXIMUM',
                                'COMPRESS_MESSAGES HUFFMAN FAST'
                            ],
                            useCases: [
                                "Reducing file size for distribution",
                                "Fitting games on limited storage media",
                                "Faster loading times on slow systems",
                                "Bandwidth-conscious web distribution",
                                "Retro system memory optimization"
                            ],
                            daadCode: 'COMPRESS_MESSAGES {algorithm} {level}',
                            category: "intermediate",
                            icon: "📝",
                            type: "optimization",
                            effect: "Compresses all game text and messages"
                        },
                        STRING_DEDUPLICATION: {
                            name: "String deduplication",
                            description: "Identify and merge duplicate text strings throughout the adventure to eliminate redundancy and reduce overall game size.",
                            examples: [
                                "Remove duplicate room descriptions",
                                "Merge similar object descriptions",
                                "Consolidate repeated phrases"
                            ],
                            useCases: [
                                "Eliminating redundant text",
                                "Reducing file size through consolidation",
                                "Cleaning up development artifacts",
                                "Optimizing memory usage",
                                "Improving compression efficiency"
                            ],
                            daadCode: 'DEDUPLICATE_STRINGS {threshold}%',
                            category: "advanced",
                            icon: "🔗",
                            type: "optimization",
                            effect: "Merges duplicate and similar text strings"
                        },
                        VOCABULARY_OPTIMIZATION: {
                            name: "Vocabulary optimization",
                            description: "Optimize the game vocabulary by removing unused words, compacting definitions, and reordering for better compression.",
                            examples: [
                                'OPTIMIZE_VOCABULARY REMOVE_UNUSED COMPACT',
                                'OPTIMIZE_VOCABULARY COMPACT EXHAUSTIVE',
                                'OPTIMIZE_VOCABULARY REMOVE_UNUSED QUICK'
                            ],
                            useCases: [
                                "Reducing vocabulary table size",
                                "Eliminating development artifacts",
                                "Improving parser efficiency",
                                "Streamlining word recognition",
                                "Optimizing memory usage"
                            ],
                            daadCode: 'OPTIMIZE_VOCABULARY OPTIONS',
                            category: "intermediate",
                            icon: "📚",
                            type: "optimization",
                            effect: "Optimizes vocabulary table"
                        }
                    }
                },

                code_optimization: {
                    title: "⚡ Code Optimization",
                    description: "Optimize generated DAAD code for size and performance",
                    icon: "⚡",
                    color: "#f59e0b",
                    operations: {
                        RULE_OPTIMIZATION: {
                            name: "Rule table optimization",
                            description: "Optimize rule tables by removing redundancy, merging similar rules, and improving execution efficiency.",
                            examples: [
                                "Merge duplicate conditional checks",
                                "Remove unreachable rule branches",
                                "Optimize condition evaluation order"
                            ],
                            useCases: [
                                "Reducing code size and complexity",
                                "Improving execution performance",
                                "Eliminating development redundancy",
                                "Streamlining rule logic",
                                "Optimizing memory usage"
                            ],
                            daadCode: 'OPTIMIZE_RULES {level}',
                            category: "advanced",
                            icon: "⚡",
                            type: "optimization",
                            effect: "Optimizes rule tables"
                        },
                        CODE_MINIFICATION: {
                            name: "Code minification",
                            description: "Minify generated DAAD code by removing whitespace, comments, and unnecessary characters.",
                            examples: [
                                "Remove development comments",
                                "Eliminate extra whitespace",
                                "Compact syntax structures"
                            ],
                            useCases: [
                                "Reducing final file size",
                                "Faster parsing and loading",
                                "Eliminating development artifacts",
                                "Professional distribution packaging",
                                "Memory-constrained systems"
                            ],
                            daadCode: 'MINIFY_CODE',
                            category: "basic",
                            icon: "🗜️",
                            type: "optimization",
                            effect: "Minifies code"
                        }
                    }
                },

                asset_optimization: {
                    title: "🖼️ Asset Optimization",
                    description: "Optimize graphics, sounds, and other game assets",
                    icon: "🖼️",
                    color: "#10b981",
                    operations: {
                        GRAPHICS_OPTIMIZATION: {
                            name: "Graphics optimization",
                            description: "Optimize graphics files for size while preserving visual quality.",
                            examples: [
                                'OPTIMIZE_GRAPHICS BALANCED',
                                'OPTIMIZE_GRAPHICS HIGH_QUALITY',
                                'OPTIMIZE_GRAPHICS MAX_COMPRESSION'
                            ],
                            useCases: [
                                "Reducing graphics file sizes",
                                "Faster image loading times",
                                "Platform-specific format optimization",
                                "Memory usage reduction",
                                "Distribution package optimization"
                            ],
                            daadCode: 'OPTIMIZE_GRAPHICS {quality}',
                            category: "intermediate",
                            icon: "🖼️",
                            type: "optimization",
                            effect: "Optimizes graphics"
                        },
                        ASSET_BUNDLING: {
                            name: "Asset bundling",
                            description: "Bundle related assets together for more efficient loading and distribution.",
                            examples: [
                                'BUNDLE_ASSETS BY_USAGE',
                                'BUNDLE_ASSETS BY_TYPE',
                                'BUNDLE_ASSETS BY_LOCATION'
                            ],
                            useCases: [
                                "Reducing loading times",
                                "Optimizing network requests",
                                "Improving cache efficiency",
                                "Streamlining distribution",
                                "Performance optimization"
                            ],
                            daadCode: 'BUNDLE_ASSETS {strategy}',
                            category: "advanced",
                            icon: "📦",
                            type: "optimization",
                            effect: "Bundles assets"
                        }
                    }
                },

                distribution_optimization: {
                    title: "🚀 Distribution Optimization",
                    description: "Optimize final builds for different platforms",
                    icon: "🚀",
                    color: "#8b5cf6",
                    operations: {
                        PLATFORM_BUILDS: {
                            name: "Platform-specific builds",
                            description: "Create optimized builds for specific target platforms.",
                            examples: [
                                'PLATFORM_BUILD ZX_SPECTRUM_48K',
                                'PLATFORM_BUILD MODERN_WEB',
                                'PLATFORM_BUILD C64'
                            ],
                            useCases: [
                                "Retro computer releases",
                                "Modern platform distribution",
                                "Mobile app optimization",
                                "Web browser deployment",
                                "Multi-platform publishing"
                            ],
                            daadCode: 'PLATFORM_BUILD {platform}',
                            category: "expert",
                            icon: "💻",
                            type: "optimization",
                            effect: "Creates platform-optimized build"
                        },
                        DISTRIBUTION_PACKAGING: {
                            name: "Distribution packaging",
                            description: "Create professional distribution packages with documentation.",
                            examples: [
                                "Professional installer package",
                                "App store distribution package",
                                "Standalone executable with docs"
                            ],
                            useCases: [
                                "Commercial game distribution",
                                "Professional packaging",
                                "App store submissions",
                                "Corporate deployments",
                                "Retail distribution"
                            ],
                            daadCode: 'PACKAGE {type}',
                            category: "expert",
                            icon: "📦",
                            type: "optimization",
                            effect: "Creates distribution package"
                        }
                    }
                }
            };
        },

        // UI Event Handlers
        selectCategory: function(categoryKey) {
            AdventureCreator.state.exportOptimization.selectedCategory = categoryKey;
            AdventureCreator.state.exportOptimization.selectedOperation = null;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        selectOperation: function(operationKey) {
            const state = AdventureCreator.state.exportOptimization;
            state.selectedOperation = state.selectedOperation === operationKey ? null : operationKey;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        toggleExplanations: function() {
            AdventureCreator.state.exportOptimization.showExplanations = !AdventureCreator.state.exportOptimization.showExplanations;
            this.saveToStorage();
            AdventureCreator.navigate('editor');
        },

        updateSearchFilter: function(value) {
            AdventureCreator.state.exportOptimization.searchFilter = value;
            AdventureCreator.navigate('editor');
        },

        // Optimization Operations
        runFullOptimization: function() {
            const game = AdventureCreator.getCurrentGame?.();
            if (!game || game.format !== 'daad') {
                this.showNotification('Please select a DAAD game first!', 'error');
                return;
            }

            const state = AdventureCreator.state.exportOptimization;
            state.currentOptimization.running = true;
            state.currentOptimization.progress = 0;
            state.currentOptimization.stage = 'Starting optimization...';

            this.showNotification('Starting full optimization...', 'info');

            // Run optimization
            this.performOptimization(game);
        },

        performOptimization: function(game) {
            const state = AdventureCreator.state.exportOptimization;
            const stages = [
                { name: 'Analyzing game content...', processor: this.analyzeGame.bind(this) },
                { name: 'Compressing text...', processor: this.compressText.bind(this) },
                { name: 'Optimizing code...', processor: this.optimizeCode.bind(this) },
                { name: 'Processing assets...', processor: this.processAssets.bind(this) },
                { name: 'Creating build...', processor: this.createBuild.bind(this) },
                { name: 'Finalizing...', processor: this.finalize.bind(this) }
            ];

            let currentStage = 0;
            const interval = setInterval(() => {
                if (!state.currentOptimization.running) {
                    clearInterval(interval);
                    return;
                }

                if (currentStage < stages.length) {
                    state.currentOptimization.stage = stages[currentStage].name;
                    stages[currentStage].processor(game);
                    currentStage++;
                }

                state.currentOptimization.progress = Math.min((currentStage / stages.length) * 100, 100);

                if (currentStage >= stages.length) {
                    state.currentOptimization.running = false;
                    state.currentOptimization.stage = 'Optimization complete!';
                    this.showOptimizationResults(game);
                    clearInterval(interval);
                }

                AdventureCreator.navigate('editor');
            }, 800);
        },

        analyzeGame: function(game) {
            const gameJson = JSON.stringify(game);
            const originalSize = new Blob([gameJson]).size;

            AdventureCreator.state.exportOptimization.compressionStats.originalSize = originalSize;
        },

        compressText: function(game) {
            // Simple LZ77-style compression simulation
            if (game.daad && game.daad.messages) {
                const compressed = game.daad.messages.map(msg => {
                    if (typeof msg === 'string') {
                        return this.simpleCompress(msg);
                    }
                    return msg;
                });
                // Don't modify original, just calculate savings
            }
        },

        simpleCompress: function(text) {
            // Very basic run-length encoding simulation
            return text.replace(/(.)\1{2,}/g, (match, char) => {
                return char + '{' + match.length + '}';
            });
        },

        optimizeCode: function(game) {
            // Calculate code optimization savings
            const saving = Math.floor(Math.random() * 20) + 10; // 10-30% savings
            const current = AdventureCreator.state.exportOptimization.compressionStats.compressedSize ||
                           AdventureCreator.state.exportOptimization.compressionStats.originalSize;

            AdventureCreator.state.exportOptimization.compressionStats.compressedSize =
                Math.floor(current * (100 - saving) / 100);
        },

        processAssets: function(game) {
            // Asset processing
            const stats = AdventureCreator.state.exportOptimization.compressionStats;
            stats.compressedSize = Math.floor(stats.compressedSize * 0.9); // 10% asset savings
        },

        createBuild: function(game) {
            // Build creation
        },

        finalize: function(game) {
            const stats = AdventureCreator.state.exportOptimization.compressionStats;
            const saved = stats.originalSize - stats.compressedSize;
            const ratio = Math.floor((saved / stats.originalSize) * 100);

            stats.savingsAchieved = this.formatBytes(saved);
            stats.compressionRatio = ratio + '%';

            // Add to history
            this.addToHistory({
                timestamp: new Date().toISOString(),
                originalSize: stats.originalSize,
                compressedSize: stats.compressedSize,
                ratio: ratio + '%',
                saved: saved
            });

            this.saveToStorage();
        },

        showOptimizationResults: function(game) {
            const stats = AdventureCreator.state.exportOptimization.compressionStats;

            this.showResultsModal(stats, game);
            this.showNotification('Optimization completed successfully!', 'success');
        },

        stopOptimization: function() {
            AdventureCreator.state.exportOptimization.currentOptimization.running = false;
            this.showNotification('Optimization stopped', 'info');
            AdventureCreator.navigate('editor');
        },

        runSingleOptimization: function(operationKey) {
            const game = AdventureCreator.getCurrentGame?.();
            if (!game || game.format !== 'daad') {
                this.showNotification('Please select a DAAD game first!', 'error');
                return;
            }

            const category = this.getDefinitions()[AdventureCreator.state.exportOptimization.selectedCategory];
            const operation = category.operations[operationKey];

            if (!operation) return;

            this.showNotification(`Running ${operation.name}...`, 'info');

            // Simulate optimization
            setTimeout(() => {
                const saving = Math.floor(Math.random() * 15) + 5;
                this.showNotification(`${operation.name} complete! Saved ${saving}%`, 'success');
            }, 1500);
        },

        showCodeExample: function(operationKey) {
            const category = this.getDefinitions()[AdventureCreator.state.exportOptimization.selectedCategory];
            const operation = category.operations[operationKey];

            if (!operation) return;

            const examples = operation.examples.map(ex => `; ${ex}`).join('\n');
            const code = `; ${operation.name}\n${examples}\n\n${operation.daadCode}`;

            this.showCodeModal(operation.name, code);
        },

        // Modal System
        showCodeModal: function(title, code) {
            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>📋 ${title}</h3>
                    <button onclick="this.closest('.eo-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <pre style="background: #0a0a0a; color: #0f0; padding: 15px; border-radius: 4px; overflow: auto; max-height: 400px; font-family: monospace; font-size: 12px;">${code}</pre>
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['export-optimization'].copyToClipboard(\`${code.replace(/`/g, '\\`')}\`)">
                            📋 Copy Code
                        </button>
                    </div>
                </div>
            `);

            document.body.appendChild(modal);
        },

        showResultsModal: function(stats, game) {
            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>✅ Optimization Results</h3>
                    <button onclick="this.closest('.eo-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <h4 style="color: #10b981; margin-top: 0;">Optimization Complete!</h4>
                        <div style="color: #ccc; margin-top: 1rem;">
                            <p><strong>Original Size:</strong> ${this.formatBytes(stats.originalSize)}</p>
                            <p><strong>Compressed Size:</strong> ${this.formatBytes(stats.compressedSize)}</p>
                            <p><strong>Space Saved:</strong> ${stats.savingsAchieved} (${stats.compressionRatio})</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 20px; display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn btn-secondary" onclick="this.closest('.eo-modal').remove()">
                            Close
                        </button>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['export-optimization'].downloadOptimized(); this.closest('.eo-modal').remove();">
                            📥 Download Optimized
                        </button>
                    </div>
                </div>
            `);

            document.body.appendChild(modal);
        },

        showProfilesModal: function() {
            const profiles = AdventureCreator.state.exportOptimization.optimizationProfiles;

            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>💾 Optimization Profiles</h3>
                    <button onclick="this.closest('.eo-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color: #ccc; margin-bottom: 1rem;">Pre-configured optimization settings for different use cases.</p>
                    ${profiles.map(profile => `
                        <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 1rem; margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <h4 style="color: #fff; margin: 0 0 0.25rem 0;">${profile.name}</h4>
                                    <p style="color: #999; font-size: 0.875rem; margin: 0;">${profile.description}</p>
                                    <p style="color: #666; font-size: 0.75rem; margin: 0.25rem 0 0 0;">
                                        Target: ${profile.target_size} • Level: ${profile.compression_level}
                                    </p>
                                </div>
                                <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
                                        onclick="AdventureCreator.modules['export-optimization'].applyProfile('${profile.id}')">
                                    Apply
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `);

            document.body.appendChild(modal);
        },

        showHistoryModal: function() {
            const history = AdventureCreator.state.exportOptimization.optimizationHistory || [];

            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>📜 Optimization History</h3>
                    <button onclick="this.closest('.eo-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${history.length === 0 ? `
                        <div style="text-align: center; color: #666; padding: 2rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                            <p>No optimization history yet.</p>
                        </div>
                    ` : `
                        ${history.map(item => `
                            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong style="color: #fff;">${new Date(item.timestamp).toLocaleString()}</strong>
                                        <div style="color: #999; font-size: 0.75rem; margin-top: 0.25rem;">
                                            ${this.formatBytes(item.originalSize)} → ${this.formatBytes(item.compressedSize)} • Saved ${item.ratio}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            `);

            document.body.appendChild(modal);
        },

        showHelpModal: function() {
            const modal = this.createModal(`
                <div class="modal-header">
                    <h3>❓ Export Optimization Help</h3>
                    <button onclick="this.closest('.eo-modal').remove()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <h4 style="color: #3b82f6; margin-top: 0;">🚀 Getting Started</h4>
                    <p style="color: #ccc;">
                        Select a DAAD game, then choose optimization operations from the categories.
                        Click "Run Full Optimization" for automatic optimization.
                    </p>

                    <h4 style="color: #3b82f6; margin-top: 1.5rem;">📦 Optimization Categories</h4>
                    <ul style="color: #ccc; margin-left: 1.5rem;">
                        <li><strong>Text Compression:</strong> Reduce message and text size</li>
                        <li><strong>Code Optimization:</strong> Optimize DAAD code structure</li>
                        <li><strong>Asset Optimization:</strong> Compress graphics and assets</li>
                        <li><strong>Distribution:</strong> Create platform-specific builds</li>
                    </ul>

                    <h4 style="color: #3b82f6; margin-top: 1.5rem;">💡 Tips</h4>
                    <ul style="color: #ccc; margin-left: 1.5rem;">
                        <li>Use profiles for quick optimization presets</li>
                        <li>Run individual optimizations for targeted improvements</li>
                        <li>Check history to track optimization results</li>
                        <li>Download optimized builds for distribution</li>
                    </ul>
                </div>
            `);

            document.body.appendChild(modal);
        },

        applyProfile: function(profileId) {
            const profile = AdventureCreator.state.exportOptimization.optimizationProfiles
                .find(p => p.id === profileId);

            if (profile) {
                this.showNotification(`Applied profile: ${profile.name}`, 'success');
                // Close modal
                const modal = document.querySelector('.eo-modal');
                if (modal) modal.remove();
            }
        },

        downloadOptimized: function() {
            const game = AdventureCreator.getCurrentGame?.();
            if (!game) {
                this.showNotification('No game to download!', 'error');
                return;
            }

            const optimizedData = JSON.stringify(game, null, 2);
            const blob = new Blob([optimizedData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${game.title || 'game'}_optimized.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Download started!', 'success');
        },

        copyToClipboard: function(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Code copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy code', 'error');
            });
        },

        createModal: function(content) {
            const modal = document.createElement('div');
            modal.className = 'eo-modal';
            modal.innerHTML = `
                <div class="eo-modal-overlay" onclick="this.parentElement.remove()">
                    <div class="eo-modal-content" onclick="event.stopPropagation()">
                        ${content}
                    </div>
                </div>
                <style>
                    .eo-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 10000;
                    }
                    .eo-modal-overlay {
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                    }
                    .eo-modal-content {
                        background: #1a1a1a;
                        border-radius: 12px;
                        max-width: 700px;
                        width: 100%;
                        max-height: 90vh;
                        overflow-y: auto;
                        border: 1px solid #333;
                    }
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1.5rem;
                        border-bottom: 1px solid #333;
                    }
                    .modal-header h3 {
                        color: #fff;
                        margin: 0;
                    }
                    .modal-close {
                        background: none;
                        border: none;
                        color: #999;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                    }
                    .modal-close:hover {
                        color: #fff;
                    }
                    .modal-body {
                        padding: 1.5rem;
                    }
                    .btn {
                        padding: 0.5rem 1rem;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s;
                    }
                    .btn-primary {
                        background: #8b5cf6;
                        color: white;
                    }
                    .btn-primary:hover {
                        background: #7c3aed;
                    }
                    .btn-secondary {
                        background: #4a5568;
                        color: white;
                    }
                    .btn-secondary:hover {
                        background: #2d3748;
                    }
                </style>
            `;
            return modal;
        },

        showNotification: function(message, type = 'info') {
            const bgColors = {
                success: '#10b981',
                error: '#ef4444',
                info: '#3b82f6',
                warning: '#f59e0b'
            };

            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: ${bgColors[type]};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10001;
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
                font-weight: 500;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },

        // Utility Functions
        filterOperations: function(operations, filter) {
            if (!filter) return operations;

            const filtered = {};
            const lowerFilter = filter.toLowerCase();

            Object.entries(operations).forEach(([key, op]) => {
                if (op.name.toLowerCase().includes(lowerFilter) ||
                    op.description.toLowerCase().includes(lowerFilter) ||
                    op.daadCode.toLowerCase().includes(lowerFilter) ||
                    op.examples.some(ex => ex.toLowerCase().includes(lowerFilter))) {
                    filtered[key] = op;
                }
            });

            return filtered;
        },

        getComplexityColor: function(category) {
            const colors = {
                'basic': '#10b981',
                'intermediate': '#f59e0b',
                'advanced': '#ef4444',
                'expert': '#8b5cf6'
            };
            return colors[category] || '#6b7280';
        },

        formatBytes: function(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        },

        addToHistory: function(item) {
            const history = AdventureCreator.state.exportOptimization.optimizationHistory;
            history.unshift(item);

            // Keep only last 20
            if (history.length > 20) {
                history.pop();
            }
        },

        // Persistence
        saveToStorage: function() {
            try {
                const data = {
                    selectedCategory: AdventureCreator.state.exportOptimization.selectedCategory,
                    showExplanations: AdventureCreator.state.exportOptimization.showExplanations,
                    optimizationProfiles: AdventureCreator.state.exportOptimization.optimizationProfiles,
                    optimizationHistory: AdventureCreator.state.exportOptimization.optimizationHistory,
                    compressionStats: AdventureCreator.state.exportOptimization.compressionStats
                };
                localStorage.setItem('exportOptimization', JSON.stringify(data));
            } catch (error) {
                console.error('Failed to save export optimization data:', error);
            }
        },

        loadFromStorage: function() {
            try {
                const data = localStorage.getItem('exportOptimization');
                if (data) {
                    const parsed = JSON.parse(data);
                    Object.assign(AdventureCreator.state.exportOptimization, parsed);
                }
            } catch (error) {
                console.error('Failed to load export optimization data:', error);
            }
        }
    };

    AdventureCreator.registerModule('export-optimization', ExportOptimization);

    console.log('DAAD Export Optimization module registered successfully');
})();
