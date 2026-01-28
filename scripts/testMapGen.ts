import { MapGenerator } from '../lib/mapGenerator';
import { RoomType, Direction } from '../lib/types';

const generator = new MapGenerator();

try {
    console.log("Generating map...");
    const grid = generator.generate();
    console.log("Map generated successfully.\n");

    // Visualization
    // We want to print (0,0) at bottom-left.
    // Console prints top-down (row 0 then row 1...).
    // So we equate array index 0 (y=0) to be printed LAST?
    // Or we stick to visual: Row 4 (Top) printed first. Row 0 (Bottom) printed last.

    for (let y = grid.height - 1; y >= 0; y--) {
        let rowLine1 = ""; // Top border/exits
        let rowLine2 = ""; // Center content + Left/Right exits
        let rowLine3 = ""; // Bottom border/exits

        for (let x = 0; x < grid.width; x++) {
            const room = grid.cells[y][x];
            if (!room) {
                rowLine1 += "     ";
                rowLine2 += "  X  ";
                rowLine3 += "     ";
                continue;
            }

            const hasN = room.exits.includes('N');
            const hasS = room.exits.includes('S');
            const hasE = room.exits.includes('E');
            const hasW = room.exits.includes('W');

            // Center char
            let char = '.';
            switch (room.type) {
                case RoomType.START: char = 'S'; break;
                case RoomType.END: char = 'E'; break;
                case RoomType.OBJECTIVE: char = 'O'; break;
                case RoomType.EVENT: char = '!'; break;
            }

            // Top
            rowLine1 += `  ${hasN ? '|' : ' '}  `;

            // Mid
            rowLine2 += `${hasW ? '-' : ' '}[${char}]${hasE ? '-' : ' '}`;

            // Bot
            // We don't really print bottom line if we print top line of next row?
            // But for visual clarity let's print full blocks.
            // Actually rowLine3 is just '  |  ' if south exists?
            // Let's just print Main + Bottom. Top is handled by previous row's bottom? No.
            // Let's print individual 3x3 chars for each cell.
        }
        console.log(rowLine1);
        console.log(rowLine2);
        // console.log(rowLine3); // Don't print bottom, allow next row's top to serve as visual separator?
        // But then we miss the South exit visualization for the bottom-most row?
        // And if we print lines, we double them.
        // Let's print top exit and middle. Bottom exit is strictly redundancy of next row's top exit (if connected).
        // EXCEPT for the very bottom row (y=0), where we might want to see if there's an exit to nowhere.
    }

    // Verify constraints
    // Verify constraints
    // Start should be at (3,0) -> y=0, x=3
    const start = grid.cells[0][3];
    // End should be at (3,6) -> y=6, x=3
    const end = grid.cells[6][3];

    console.log("\n--- Verification ---");
    console.log(`Start at (3,0): ${start?.type === RoomType.START ? 'PASS' : 'FAIL'} (Type: ${start?.type})`);
    console.log(`End at (3,6): ${end?.type === RoomType.END ? 'PASS' : 'FAIL'} (Type: ${end?.type})`);

    const objectives = grid.cells.flat().filter(r => r?.type === RoomType.OBJECTIVE);
    console.log(`Objectives Count: ${objectives.length} (Expected 3)`);

    // Log Exits of Start/End
    console.log(`Start Exits: ${start?.exits.join(',')}`);
    console.log(`End Exits: ${end?.exits.join(',')}`);

} catch (e) {
    console.error("Generation failed:", e);
}
