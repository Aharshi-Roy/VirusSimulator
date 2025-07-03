class Person
{
    constructor(state, name)
    {
        this.state = state;
        this.name = name;
        this.store_become_normal = false;
        this.store_become_immune = false;
        this.gen_stayed = 0;
        this.stay_limit = 0;
        this.store_die = false;
        this.store_sick = false;
    }
    get_infected(virus)
    {
        this.state = "sick";
        this.name = virus.name;
        this.gen_stayed = 0;
        this.stay_limit = virus.stay_time;
    }
    get_immune(virus)
    {
        this.state = "immune";
        this.name = virus.name;
    }
    die()
    {
        this.state = "dead";
        this.name = "o";
    }
    become_normal()
    {
        this.state = "normal";
        this.name = "o";
    }
}

class Virus
{
    constructor(name, kill_rate, stay_time, infect_rate)
    {
        this.name = name;
        this.kill_rate = kill_rate
        this.stay_time = stay_time;
        this.infect_rate = infect_rate;
    }
}
function ask_for_board_specifics()
{
    while (true)
    {
        let width = prompt("What dimensions would you like the board to be? 10x10 is a good start. At 30x30, it starts lagging a bit. First, enter the width.");
        width = Number(width);
        if (Number.isInteger(width))
        {
            board_width = width;
            if (board_width <= 0)
            {
                board_width = 10;
            }
            break;
        }
    }
    while (true)
    {
        let height = prompt("What should the height of the board be?");
        height = Number(height);
        if (Number.isInteger(height))
        {
            board_height = height;
            if (board_height <= 0)
            {
                board_height = 10;
            }
            break;
        }
    }
    while (true)
    {
        let a_state = prompt("Would you like all the people in the board to be dead, or alive?")
        a_state = a_state.toUpperCase();
        if (a_state == "ALIVE")
        {
            starting_state = "normal";
            break;
        }
        else if (a_state == "DEAD")
        {
            starting_state = "dead";
            break;
        }
    }
    if (starting_state != "dead" || starting_state != "normal")
    {
        starting_state = "normal";
    }
    let answer;
    answer = prompt("For the next questions we will ask, whether you would like some pre installed simulated viruses. For yes, type 'yes', and type anything else for no.\nWould you like the 'E' virus?\nKill rate: 66\nStay time: 5\nInfection rate: 40");
    answer = answer.toUpperCase();
    if (answer == "YES" || answer == "")
    {
        virus_array.push(new Virus("E", 66, 5, 40));
    }
    answer = prompt("Would you like the 'K' virus? It kills everyone. The purpose is to wip the board and make every one dead.\nKill rate: 100\nStay time: 5\nInfection rate: 100");
    answer = answer.toUpperCase();
    if (answer == "YES" || answer == "")
    {
        virus_array.push(new Virus("K", 100, 5, 100));
    }
    answer = prompt("Would you like the 'W' virus? It really isn't a virus. It's actually a virus that doesn't infect anyone, and it stays in the patient for a long time. This essentially makes it a wall, allowing you to split the board into different sections.\nKill rate: 0\nStay time: 1000000\nInfection rate: 0");
    answer = answer.toUpperCase();
    if (answer == "YES" || answer == "")
    {
        virus_array.push(new Virus("W", 0, 1000000, 0));
    }
}
let board = document.getElementById("board");
let controls = document.getElementById("controls");
let g_enabled = "none";
let g_virus = "none";
let virus_array = [];
let reproduce_rate = 50;
let board_width = 10;
let board_height = 10;
let starting_state = "normal";
let directions = ["north", "south", "west", "east"];
let timer;
let timer_is_on = false;
let generations = 0;
let spf = 1;
let g_i;
ask_for_board_specifics();
let population = Array(board_height).fill(0).map(() => Array(board_width).fill(0));
function make_board()
{
    for (let i = 0; i < board_height; i++)
    {
        for (let j = 0; j < board_width; j++)
        {
            population[i][j] = new Person(starting_state, "o");
        }
    }
}
make_board();
function create_board()
{
    board.innerHTML = "";
    for (let i = board_height-1; i >= 0; i--)
    {
        for (let j = 0; j < board_width; j++)
        {
            board.innerHTML += create_button(population[i][j], i, j);
        }
        board.innerHTML += "<br>";
    }
}

function create_button(player, y, x)
{
    let color;
    if (player.state == "normal")
    {
        color = "green";
    }
    else if (player.state == "immune")
    {
        color = "blue";
    }
    else if (player.state == "sick")
    {
        color = "red";
    }
    else if (player.state == "dead")
    {
        color = "grey";
    }
    return "<button style=\"background-color: " + color + "; border: none; width: 25px; height: 25px;\" onclick=\"change_board(" + y + ", " + x + ")\">" + player.name + "</button>";
}

function make_controls(enable, v_num)
{
    controls.innerHTML = "";
    if (enable == "timer" || timer_is_on == true)
    {
        if (enable == "timer") timer = setInterval(update, (spf*1000));
        controls.innerHTML = "<button onclick=\"make_controls('pause')\"> Pause </button>";
        timer_is_on = true;
    }
    if (enable == "pause" || timer_is_on == false)
    {
        if (enable == "pause") clearInterval(timer);
        controls.innerHTML = "<button onclick=\"make_controls('timer')\"> Start </button>";
        timer_is_on = false;
    }
    controls.innerHTML += "    <button onclick=\"update()\">Update by 1 frame </button><br>";
    
    controls.innerHTML += "<button onclick=\"make_controls('normal')\"> Make normal</button>";
    if (enable == "normal")
    {
        controls.innerHTML += "Enabled";
        g_enabled = "normal";
    }
    controls.innerHTML += "<br>";
    controls.innerHTML += "<button onclick=\"make_controls('kill')\">Kill</button>";
    if (enable == "kill")
    {
        controls.innerHTML += "Enabled";
        g_enabled = "kill";
    }
    controls.innerHTML += "<br>";
    controls.innerHTML += "<button onclick=\"make_new_virus()\">New virus+</button> <br>";
    controls.innerHTML += "<p>Reproduction rate: " + reproduce_rate + "<button onclick=\"edit('reproduction_rate')\">Edit</button>";
    controls.innerHTML += "<p> Seconds per frame: " + spf + "<button onclick=\"edit('spf')\">Edit</button>";
    controls.innerHTML += "<p>Generations: " + generations + "</p>";

    controls.innerHTML += "<h1> Virus options <h1>";
    for (let i = 0; i < virus_array.length; i++)
    {
        let virus = virus_array[i];
        controls.innerHTML += "<p> Virus '" + virus.name + "'</p>";
        controls.innerHTML += "<button onclick=\"make_controls('infect', " + i + ")\">Infect</button>";
        if (enable == "infect" && v_num == i)
        {
            controls.innerHTML += "Enabled";
            g_enabled = "infect";
            g_virus = virus_array[i];
            g_i = i;
        }
        controls.innerHTML += "<br>";
        controls.innerHTML += "<button onclick=\"make_controls('immune', " + i + ")\">Immune</button>";
        if (enable == "immune" && v_num == i)
        {
            controls.innerHTML += "Enabled";
            g_enabled = "immune";
            g_virus = virus_array[i];
            g_i = i;
        } 
    }
}

function change_board(y, x)
{
    if (g_enabled == "immune")
    {
        population[y][x].get_immune(g_virus);
    }
    else if (g_enabled == "infect")
    {
        population[y][x].get_infected(g_virus);
    }
    else if (g_enabled == "normal")
    {
        population[y][x].become_normal();
    }
    else if (g_enabled == "kill")
    {
        population[y][x].die();
    }
    create_board();
}

function make_new_virus()
{
    let v_name;
    let v_kill_rate;
    let v_stay;
    let v_inf;
    do
    {
        v_name = prompt("Enter the virus name. It can't be 'o', and it has to be one character long. It also can't be a virus that already exists.");
        if (v_name.length == 1 && v_name != "o" && !check_for_virus(v_name))
        {
            break;
        }
    } while(true)
    do
    {
        v_kill_rate = prompt("Enter the kill rate. It will be out of 100, so enter a number from 0-100. No decimals.");
        v_kill_rate = Number(v_kill_rate);
        if (Number.isInteger(v_kill_rate) && v_kill_rate >= 0 && v_kill_rate <= 100)
        {
            break;
        }
    } while(true)
    do
    {
        v_stay = prompt("How many generations should the virus stay in the patient?");
        v_stay = Number(v_stay);
        if (Number.isInteger(v_stay))
        {
            break;
        }
    } while(true)
    do
    {
        v_inf = prompt("Enter the infection rate. It will be from 0-100. No decimals.");
        v_inf = Number(v_inf);
        if (Number.isInteger(v_inf) && v_inf >= 0 && v_inf <= 100)
        {
            break;
        }
    } while(true)
    virus_array.push(new Virus(v_name, v_kill_rate, v_stay, v_inf));
    make_controls();
}

function check_for_virus(name)
{
    for (let i = 0; i < virus_array.length; i++)
    {
        if (virus_array[i].name == name)
        {
            return true;
        }
    }
    return false;
}

function update()
{ 
    generations++;
    for (let i = 0; i < board_height; i++)
    {
        for (let j = 0; j < board_width; j++)
        {
            if (population[i][j].state == "dead")
            {
                let r_num = Math.floor(Math.random() * 100);
                if (r_num < reproduce_rate)
                {
                    let is_n = check_around(i, j, "normal");
                    let is_i = check_around(i, j, "immune");
                    if (is_n == false && is_i == false);
                    else if (is_n == true && is_i == false)
                    {
                        population[i][j].store_become_normal = true;
                    }
                    else if (is_i == true)
                    {
                        while (true)
                        {
                            let direction;
                            let rd;
                            rd = Math.floor(Math.random() * 4);
                            if (rd == 0) direction = "north";
                            else if (rd == 1) direction = "south";
                            else if (rd == 2) direction = "west";
                            else if (rd == 3) direction = "east";
                            let person = return_person(i, j, direction);
                            if (person.state == "normal" || person.state == "immune")
                            {
                                population[i][j].name = person.name;
                                if (person.state == "normal")
                                {
                                    population[i][j].store_become_normal = true;
                                }
                                else
                                {
                                    population[i][j].store_become_immune = true;
                                }
                                break;
                            }
                        }
                        
                    }
                }
            }
            else if (population[i][j].state == "sick")
            {
                population[i][j].gen_stayed++;
                let virus = search_virus(population[i][j].name)
                if (population[i][j].gen_stayed > population[i][j].stay_limit)
                {
                    let k_num = Math.floor(Math.random() * 100)
                    if (k_num < virus.kill_rate)
                    {
                        population[i][j].store_die = true;
                    }
                    else
                    {
                        population[i][j].store_become_immune = true;
                    }
                }
                else
                {
                    let i_num = Math.floor(Math.random() * 100)
                    if (i_num < virus.infect_rate)
                    {
                        let can_infect = false;
                        for (let k = 0; k < 4; k++)
                        {
                            let t_person = return_person(i, j, directions[k]);
                            if (t_person.state == "normal" || (t_person.state == "immune" && t_person.name != virus.name))
                            {
                                can_infect = true;
                            }
                        }
                        if (can_infect == true)
                        {
                            while (true)
                                {
                                    let direction;
                                    let rd;
                                    rd = Math.floor(Math.random() * 4);
                                    if (rd == 0) direction = "north";
                                    else if (rd == 1) direction = "south";
                                    else if (rd == 2) direction = "west";
                                    else if (rd == 3) direction = "east";
                                    let person = return_person(i, j, direction);
                                    if (person.state == "normal" || (person.state == "immune" && person.name != virus.name))
                                    {
                                        person.name = population[i][j].name;
                                        person.store_sick = true;
                                        break;
                                    }
                                }
                        }
                    }
                }
            }
        }
    }
    update_population();
    make_controls(g_enabled, g_i);
    create_board();
}

function check_around(y, x, thing)
{
    if (y-1 >= 0) if (population[y-1][x].state == thing) return true;
    if (y+1 < board_height) if (population[y+1][x].state == thing) return true;
    if (x-1 >= 0) if (population[y][x-1].state == thing) return true;
    if (x+1 < board_width) if (population[y][x+1].state == thing) return true;
    return false;
}

function update_population()
{
    for (let i= 0; i < board_height; i++)
    {
        for (let j = 0; j < board_width; j++)
        {
            if (population[i][j].store_become_normal == true)
            {
                population[i][j].become_normal();
                population[i][j].store_become_normal = false;
            }
            if (population[i][j].store_become_immune == true)
            {
                population[i][j].get_immune(search_virus(population[i][j].name));
                population[i][j].store_become_immune = false;
            }
            if (population[i][j].store_die == true)
            {
                population[i][j].die()
                population[i][j].store_die = false;
            }
            if (population[i][j].store_sick == true)
            {
                population[i][j].get_infected(search_virus(population[i][j].name));
                population[i][j].store_sick = false;
            }
        }
    }
}

function return_person(y, x, direction)
{
    if (direction == "none") return population[y][x];
    if (direction == "north" && y+1 < board_height) return population[y+1][x];
    if (direction == "south" && y-1 >= 0) return population[y-1][x];
    if (direction == "west" && x-1 >= 0) return population[y][x-1];
    if (direction == "east" && x+1 < board_width) return population[y][x+1];
    return population[y][x];
}

function search_virus(v_name)
{
    for (let i = 0; i < virus_array.length; i++)
    {
        if (virus_array[i].name == v_name)
        {
            return virus_array[i];
        }
    }
}

function edit(thing)
{
    let test;
    if (thing == "reproduction_rate")
    {
        do
        {
            test = prompt("What should the reproduction rate be? It will be a percentage from 0-100. Don't put the % sign. No decimals.");
            test = Number(test);
            if (Number.isInteger(test) && test >= 0 && test <= 100)
            {
                reproduce_rate = test;
                break;
            }
        } while(true)
    }
    else if (thing == "spf")
    {
        do
        {
            test = prompt("How many seconds do you want to be passed every frame when you run the game? WARNING: If you go to low, like 0.1, the simulation might update so fast, you can't press any buttons or to pause it. Same thing happens if you put a letter in. Also, if you change this rate while the simulation is running, you have to pause and start it again.");
            test = Number(test);
            if (Number.isInteger(test) || test % 1 != 0)
            {
                spf = test;
                break;
            }
        } while(true)
    }
    make_controls();
}
