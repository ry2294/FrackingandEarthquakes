/*
dbqueries.sql contains the logic of our algorithm. The getwells function takes in four values which form the four boundary points for the region surrounding the origin of the earth quake with a radius of 10 km. With in this region we try to identify if there exists a injection well. If so, then it passes the spatial dimension of our algorithm. Then, we also check whether there exists atleast one active injection well in the total wells present in the region. If so, then it passes the temporal dimension. Finally, we check if there doesn't exist a fault lime in th region. If all these conditions pass, then we classify the earthquake as a Manmade else Source Ambiguous.
*/

CREATE OR REPLACE FUNCTION getwells(text, text, text, text)
  RETURNS SETOF wells AS
$BODY$
    SELECT * FROM wells 
    WHERE cast($1 as double precision) <= cast(lat as double precision) and
      cast(lat as double precision) <= cast($2 as double precision) and
      cast($3 as double precision) <= cast(lon as double precision) and
      cast(lon as double precision) <= cast($4 as double precision) 
      and NOT exists (select 1 from earthquakes eq 
      where cast($1 as double precision) <= cast(eq.lat as double precision) and
      cast(eq.lat as double precision) <= cast($2 as double precision) and
      cast($3 as double precision) <= cast(eq.lon as double precision) and
      cast(eq.lon as double precision) <= cast($4 as double precision) );
$BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION getwells(text, text)
  OWNER TO rakesh891;
