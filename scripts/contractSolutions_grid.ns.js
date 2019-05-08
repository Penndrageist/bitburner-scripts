function recurseGrid(grid, x, y)
{
	if(x == grid.length - 1 && y == grid[0].length - 1)
	{
		return 1;
	}
	else if(x == grid.length || y == grid[0].length)
	{
		return 0;
	}
	else if(grid[x][y] == 1)
	{
		return 0;
	}
	else
	{
		return recurseGrid(grid, x + 1, y) + recurseGrid(grid, x, y + 1);
	}
}

// given array [x,y], how many paths from [0,0]->{x-1,y-1], going down/right only
export async function uniqueGridPathsI(data) 
{ 
    var grid = [];
    
    for(var x = 0; x < data[0]; x++)
    {
        grid[x]=[];
        for(var y = 0; y < data[1]; y++)
        {
            grid[x][y] = 0;
        }
    }
    
    return recurseGrid(grid, 0, 0); 
}

// given a 10x10 grid of 0 or 1, unique paths from [0,0]->{x-1,y-1], going down/right only, avoiding 1s
export async function uniqueGridPathsII(data) 
{
    return recurseGrid(data, 0, 0); 
}