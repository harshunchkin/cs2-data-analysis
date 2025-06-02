library(sf)
library(tidyverse)
library(rayshader)
library(stars)
library(ggplot2)
library(plotly)
library(MetBrewer)
library(colorspace)
library(rgl)
library(terra)
library(png)


bomb_data_csv <- read.csv("bombdata.csv") |>
  select(X,Y)
View(bomb_data_csv)
bomb_data_csv



#convert to sf - coordinate ref system
bd_sf_data <- st_as_sf(bomb_data_csv, coords = c("X", "Y"), crs = 3857)  


#View(bd_sf_data)
summarise(bd_sf_data)
#nrow(bd_sf_data) +
#bd_sf_data |>
  #ggplot()+
  #geom_sf()+
  #geom_sf(data = bottom_left_b, color = "red")
  


#st_coordinates(bd_sf_data)


#define aspect ratio boundaries
bb <- st_bbox(bd_sf_data)
bb

bottomleft <- st_point(c(bb[["xmin"]], bb[["ymin"]]))|>
  st_sfc(crs = st_crs(bd_sf_data))
bottomright <- st_point(c(bb[["xmax"]], bb[["ymin"]]))|>
  st_sfc(crs = st_crs(bd_sf_data))

bd_sf_data |>
  ggplot()+
  geom_sf()+
  geom_sf(data = bottomleft, color = "blue")+
  geom_sf(data = bottomright, color = "red")


grid_size <- 30  # Adjust as needed
grid <- st_make_grid(bd_sf_data, cellsize = grid_size, what = "polygons") |> 
  st_sf() |>
    mutate(grid_id = row_number())  # Add unique grid ID

# count the frequency of the points in a cell
sf_data_freq <- st_join(bd_sf_data, grid, join = st_within)|>
  group_by(grid_id) |>
    summarise(occurrences = n(), .groups = "drop")|>
      st_drop_geometry()


# verifying that the points are actually assigned a grid
View(sf_data_freq)
print(sum(sf_data_freq$occurrences))


grid_data <- left_join(grid, sf_data_freq, by = "grid_id") |> 
  replace_na(list(occurrences = 0))  # Fill empty cells with 0
View(grid_data)


size <- 700  # Resolution
rasterized <- st_rasterize(grid_data, 
                           nx = size, 
                           ny = size)

filter_raster <- rasterized 
filter_raster[filter_raster == 0] <- NA


mat <- matrix(filter_raster$occurrences, nrow = size, ncol  = size)

#View(mat)

c1 <- met.brewer("Hokusai2")
swatchplot(c1)
texture <- grDevices::colorRampPalette(c1, bias  =1.2)(256)
swatchplot(texture)

# Ensure rgl device exists before closing
if (rgl.cur())
  close3d()

open3d()  # Open a new 3D rendering window



mat |>
  height_shade(texture = texture) |> 
  #add_annotations(p,"lappi")|>
  plot_3d(heightmap = mat,
         zscale = 0.2,
         solid = TRUE,
         shadowdepth  = 0)



render_camera(theta = 60, phi = 30, zoom = 0.75)



render_highquality(
  filename = "output_plots/bombplot.png",
  interactive = FALSE,
  lightdirection = 280,
  lightaltitude = c(20, 80),
  lightintensity = c(600, 100),
  samples = 450,
  width = 1000,
  height = 1000,
)


